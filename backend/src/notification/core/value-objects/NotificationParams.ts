export class NotificationParams {
  public readonly value: Record<string, string | number>;
  private constructor(value: Record<string, string | number>) { this.value = value; }

  public static create(value?: Record<string, string | number>): NotificationParams {
    return new NotificationParams(value ?? {});
  }
}
