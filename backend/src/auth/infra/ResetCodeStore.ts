import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ResetCodeStoreInterface } from '../app/ports/ResetCodeStoreInterface';

@Injectable()
export class ResetCodeStore implements ResetCodeStoreInterface {
  private _store = new Map<string, { codeHash: string; expiry: Date }>();

  async store(email: string, code: string): Promise<void> {
    const codeHash = await hash(code, 10);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    this._store.set(email.toLowerCase(), { codeHash, expiry });
  }

  async verify(email: string, code: string): Promise<boolean> {
    const entry = this._store.get(email.toLowerCase());
    if (!entry) return false;
    if (new Date() > entry.expiry) {
      this._store.delete(email.toLowerCase());
      return false;
    }
    return compare(code, entry.codeHash);
  }

  async delete(email: string): Promise<void> {
    this._store.delete(email.toLowerCase());
  }
}
