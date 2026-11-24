import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

export type OAuthProviderName = 'google' | 'facebook';

interface OAuthProviderDefinition {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
}

export interface OAuthProviderConfig extends OAuthProviderDefinition {
  clientId: string;
  clientSecret: string;
}

export interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
}

export interface OAuthPendingState {
  provider: OAuthProviderName;
  redirectUri: string;
  expiresAt: number;
}

export interface OAuthSession {
  at: string;
  rt: string;
  user: unknown;
  isNewUser: boolean;
  expiresAt: number;
}

const STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_REDIRECT_SCHEMES = ['sugarcheck', 'exp', 'exps'];

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly states = new Map<string, OAuthPendingState>();
  private readonly sessions = new Map<string, OAuthSession>();
  private readonly allowedSchemes: string[];

  constructor(private readonly configService: ConfigService) {
    this.allowedSchemes = (
      this.configService.get<string>('OAUTH_REDIRECT_SCHEMES') ??
      DEFAULT_REDIRECT_SCHEMES.join(',')
    )
      .split(',')
      .map((scheme) => scheme.trim().toLowerCase())
      .filter(Boolean);
  }

  getProviderConfig(provider: OAuthProviderName): OAuthProviderConfig | null {
    const definition = this.getProviderDefinition(provider);
    const clientId = this.configService.get<string>(definition.clientIdEnv);
    const clientSecret = this.configService.get<string>(definition.clientSecretEnv);

    if (!clientId || !clientSecret) {
      return null;
    }

    return { ...definition, clientId, clientSecret };
  }

  isAllowedRedirect(redirectUri: string): boolean {
    try {
      const url = new URL(redirectUri);
      const scheme = url.protocol.replace(':', '').toLowerCase();

      if (this.allowedSchemes.includes(scheme)) return true;

      // Útil para Expo Web / frontend local durante el desarrollo.
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      return (scheme === 'http' || scheme === 'https') && isLocalhost;
    } catch {
      return false;
    }
  }

  createAuthorizationUrl(
    provider: OAuthProviderName,
    config: OAuthProviderConfig,
    appRedirectUri: string,
    publicBaseUrl: string,
  ): string {
    const state = randomBytes(24).toString('hex');

    this.pruneExpired();
    this.states.set(state, {
      provider,
      redirectUri: appRedirectUri,
      expiresAt: Date.now() + STATE_TTL_MS,
    });

    const url = new URL(config.authorizationEndpoint);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', this.buildCallbackUrl(publicBaseUrl, provider));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('state', state);

    if (provider === 'google') {
      // Permite al usuario elegir cuenta en lugar de reutilizar la sesión.
      url.searchParams.set('prompt', 'select_account');
    }

    return url.toString();
  }

  buildCallbackUrl(publicBaseUrl: string, provider: OAuthProviderName): string {
    return `${publicBaseUrl.replace(/\/+$/, '')}/auth/oauth/${provider}/callback`;
  }

  consumeState(state: string): OAuthPendingState | null {
    const entry = this.states.get(state);
    if (!entry) return null;

    this.states.delete(state);
    if (entry.expiresAt < Date.now()) return null;

    return entry;
  }

  async fetchProfile(
    provider: OAuthProviderName,
    code: string,
    publicBaseUrl: string,
  ): Promise<OAuthProfile | null> {
    const config = this.getProviderConfig(provider);
    if (!config) return null;

    try {
      const accessToken = await this.exchangeCodeForToken(
        provider,
        config,
        code,
        this.buildCallbackUrl(publicBaseUrl, provider),
      );

      if (!accessToken) return null;

      if (provider === 'google') {
        return await this.fetchGoogleProfile(config, accessToken);
      }

      return await this.fetchFacebookProfile(config, accessToken);
    } catch (error) {
      this.logger.error(
        `No se pudo obtener el perfil de ${provider}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  createSession(session: Omit<OAuthSession, 'expiresAt'>): string {
    this.pruneExpired();

    const code = randomBytes(24).toString('hex');
    this.sessions.set(code, { ...session, expiresAt: Date.now() + SESSION_TTL_MS });
    return code;
  }

  consumeSession(code: string): OAuthSession | null {
    const entry = this.sessions.get(code);
    if (!entry) return null;

    this.sessions.delete(code);
    if (entry.expiresAt < Date.now()) return null;

    return entry;
  }

  appendQueryParams(uri: string, params: Record<string, string>): string {
    const url = new URL(uri);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  private getProviderDefinition(provider: OAuthProviderName): OAuthProviderDefinition {
    const graphVersion = this.configService.get<string>('FACEBOOK_GRAPH_VERSION') ?? 'v23.0';

    if (provider === 'google') {
      return {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
        scope: 'openid email profile',
        clientIdEnv: 'GOOGLE_CLIENT_ID',
        clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
      };
    }

    return {
      authorizationEndpoint: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenEndpoint: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      userInfoEndpoint: `https://graph.facebook.com/${graphVersion}/me`,
      scope: 'email,public_profile',
      clientIdEnv: 'FACEBOOK_APP_ID',
      clientSecretEnv: 'FACEBOOK_APP_SECRET',
    };
  }

  private async exchangeCodeForToken(
    provider: OAuthProviderName,
    config: OAuthProviderConfig,
    code: string,
    redirectUri: string,
  ): Promise<string | null> {
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      this.logger.warn(
        `${provider} rechazó el canje del código (status ${response.status})`,
      );
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  }

  private async fetchGoogleProfile(
    config: OAuthProviderConfig,
    accessToken: string,
  ): Promise<OAuthProfile | null> {
    const response = await fetch(config.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!data.sub || !data.email || data.email_verified === false) return null;

    return {
      providerId: data.sub,
      email: data.email,
      name: data.name ?? data.email.split('@')[0],
    };
  }

  private async fetchFacebookProfile(
    config: OAuthProviderConfig,
    accessToken: string,
  ): Promise<OAuthProfile | null> {
    const url = new URL(config.userInfoEndpoint);
    url.searchParams.set('fields', 'id,name,email');
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      id?: string;
      name?: string;
      email?: string;
    };

    if (!data.id || !data.email) return null;

    return {
      providerId: data.id,
      email: data.email,
      name: data.name ?? data.email.split('@')[0],
    };
  }

  private pruneExpired(): void {
    const now = Date.now();

    for (const [key, value] of this.states) {
      if (value.expiresAt < now) this.states.delete(key);
    }

    for (const [key, value] of this.sessions) {
      if (value.expiresAt < now) this.sessions.delete(key);
    }
  }
}
