import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OAuthExchangeDTO } from './DTOs/oauth-exchange.dto';
import { OAuthProviderName, OAuthService } from './oauth/oauth.service';
import { cookieOptionsAccessToken, cookieOptionsRefreshToken } from './cookie-options';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';

/**
 * Flujo OAuth pensado para clientes que no son navegador (app móvil).
 *
 * 1. `GET /auth/oauth/:provider/start?redirect_uri=<deep link>` → redirige al proveedor.
 * 2. El proveedor vuelve a `GET /auth/oauth/:provider/callback`.
 * 3. El backend canjea el código, crea la sesión y redirige al deep link con
 *    un código de un solo uso.
 * 4. La app canjea ese código en `POST /auth/oauth/exchange`.
 */
@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly authService: AuthService,
    private readonly translationService: TranslationService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':provider/start')
  start(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const name = this.parseProvider(provider);
    if (!name) {
      throw new BadRequestException('Proveedor OAuth no soportado');
    }

    if (!redirectUri || !this.oauthService.isAllowedRedirect(redirectUri)) {
      throw new BadRequestException('redirect_uri inválido o no permitido');
    }

    const config = this.oauthService.getProviderConfig(name);
    if (!config) {
      throw new BadRequestException(
        `El proveedor ${name} no está configurado en el servidor`,
      );
    }

    const authorizationUrl = this.oauthService.createAuthorizationUrl(
      name,
      config,
      redirectUri,
      this.resolveBaseUrl(req),
    );

    return res.redirect(authorizationUrl);
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') providerError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const name = this.parseProvider(provider);
    if (!name) {
      throw new BadRequestException('Proveedor OAuth no soportado');
    }

    const pending = state ? this.oauthService.consumeState(state) : null;
    if (!pending || pending.provider !== name) {
      throw new BadRequestException('Estado OAuth inválido o expirado');
    }

    if (providerError) {
      return res.redirect(
        this.oauthService.appendQueryParams(pending.redirectUri, {
          error: 'access_denied',
        }),
      );
    }

    if (!code) {
      return res.redirect(
        this.oauthService.appendQueryParams(pending.redirectUri, {
          error: 'missing_code',
        }),
      );
    }

    const profile = await this.oauthService.fetchProfile(
      name,
      code,
      this.resolveBaseUrl(req),
    );

    if (!profile) {
      return res.redirect(
        this.oauthService.appendQueryParams(pending.redirectUri, {
          error: 'oauth_profile_failed',
        }),
      );
    }

    const result = await this.authService.loginFirebaseUser({
      email: profile.email,
      name: profile.name,
      firebaseUid: `${name}:${profile.providerId}`,
    });

    if (!result.isValid) {
      this.logger.warn(
        `Login OAuth rechazado para ${profile.email}: ${result.getError().message}`,
      );
      return res.redirect(
        this.oauthService.appendQueryParams(pending.redirectUri, {
          error: 'account_unavailable',
        }),
      );
    }

    const { at, rt, user, isNewUser } = result.getValue();
    const oneTimeCode = this.oauthService.createSession({ at, rt, user, isNewUser });

    return res.redirect(
      this.oauthService.appendQueryParams(pending.redirectUri, {
        code: oneTimeCode,
      }),
    );
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchange(
    @Body() body: OAuthExchangeDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = this.oauthService.consumeSession(body.code);
    const lang = this.translationService.resolveLanguage(
      req.headers['accept-language'] as string,
    );

    if (!session) {
      throw new UnauthorizedException(
        this.translationService.translate('OAUTH_CODE_INVALID', lang),
      );
    }

    res.cookie('access_token', session.at, cookieOptionsAccessToken);
    res.cookie('refresh_token', session.rt, cookieOptionsRefreshToken);

    return {
      message: this.translationService.translate('OAUTH_LOGIN_SUCCESS', lang),
      user: session.user,
      accessToken: session.at,
      isNewUser: session.isNewUser,
    };
  }

  private parseProvider(provider: string): OAuthProviderName | null {
    return provider === 'google' || provider === 'facebook' ? provider : null;
  }

  private resolveBaseUrl(req: Request): string {
    const configured = this.configService.get<string>('BACKEND_PUBLIC_URL');
    if (configured) {
      return configured.replace(/\/+$/, '');
    }

    const forwarded = req.headers['x-forwarded-proto'];
    const proto =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ||
      req.protocol;

    return `${proto}://${req.get('host')}`;
  }
}
