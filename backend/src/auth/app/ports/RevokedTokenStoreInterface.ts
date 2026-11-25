export interface RevokedTokenStoreInterface {
  /**
   * Marca un refresh token como revocado hasta que expire de forma natural.
   */
  revoke(data: { jti: string; expiresAt: Date }): Promise<void>;

  /**
   * Indica si el `jti` ya fue revocado (logout explícito).
   */
  isRevoked(jti: string): Promise<boolean>;
}
