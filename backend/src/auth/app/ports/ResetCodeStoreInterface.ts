export interface ResetCodeStoreInterface {
  store(email: string, code: string): Promise<void>;
  verify(email: string, code: string): Promise<boolean>;
  delete(email: string): Promise<void>;
}
