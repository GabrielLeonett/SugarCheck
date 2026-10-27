import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ResetCodeStoreInterface } from '../app/ports/ResetCodeStoreInterface';

const MAX_VERIFY_ATTEMPTS = 5;
const CODE_TTL_MS = 10 * 60 * 1000;

interface ResetCodeEntry {
  codeHash: string;
  expiry: Date;
  attempts: number;
}

@Injectable()
export class ResetCodeStore implements ResetCodeStoreInterface {
  private _store = new Map<string, ResetCodeEntry>();

  async store(email: string, code: string): Promise<void> {
    const codeHash = await hash(code, 10);
    this._store.set(this.normalize(email), {
      codeHash,
      expiry: new Date(Date.now() + CODE_TTL_MS),
      attempts: 0,
    });
  }

  async verify(email: string, code: string): Promise<boolean> {
    const key = this.normalize(email);
    const entry = this._store.get(key);
    if (!entry) return false;

    if (new Date() > entry.expiry) {
      this._store.delete(key);
      return false;
    }

    const isValid = await compare(code, entry.codeHash);

    if (!isValid) {
      entry.attempts += 1;
      // Tras demasiados intentos el código se invalida para evitar fuerza bruta.
      if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
        this._store.delete(key);
      }
    }

    return isValid;
  }

  async delete(email: string): Promise<void> {
    this._store.delete(this.normalize(email));
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}
