import { UserId } from '../../shared/core/value-objects/UserId';
import { NotificationId } from './value-objects/NotificationId';
import { NotificationType } from './value-objects/NotificationType';
import { NotificationTitle } from './value-objects/NotificationTitle';
import { NotificationMessage } from './value-objects/NotificationMessage';
import { NotificationLink } from './value-objects/NotificationLink';
import { NotificationTitleKey } from './value-objects/NotificationTitleKey';
import { NotificationMessageKey } from './value-objects/NotificationMessageKey';
import { NotificationParams } from './value-objects/NotificationParams';

interface NotificationProps {
  id: NotificationId;
  userId: UserId;
  type: NotificationType;
  title: NotificationTitle;
  message: NotificationMessage;
  titleKey?: NotificationTitleKey;
  messageKey?: NotificationMessageKey;
  params?: NotificationParams;
  link: NotificationLink;
  read: boolean;
  createdAt: Date;
}

export interface NotificationPlain {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  titleKey?: string;
  messageKey?: string;
  params?: Record<string, string | number>;
  link: string;
  read: boolean;
  createdAt: string;
}

export class Notification {
  private readonly _id: NotificationId;
  private readonly _userId: UserId;
  private readonly _type: NotificationType;
  private readonly _title: NotificationTitle;
  private readonly _message: NotificationMessage;
  private readonly _titleKey?: NotificationTitleKey;
  private readonly _messageKey?: NotificationMessageKey;
  private readonly _params?: NotificationParams;
  private readonly _link: NotificationLink;
  private _read: boolean;
  private readonly _createdAt: Date;

  constructor(props: NotificationProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._type = props.type;
    this._title = props.title;
    this._message = props.message;
    this._titleKey = props.titleKey;
    this._messageKey = props.messageKey;
    this._params = props.params;
    this._link = props.link;
    this._read = props.read;
    this._createdAt = props.createdAt;
  }

  get id(): NotificationId { return this._id; }
  get userId(): UserId { return this._userId; }
  get type(): NotificationType { return this._type; }
  get title(): NotificationTitle { return this._title; }
  get message(): NotificationMessage { return this._message; }
  get titleKey(): NotificationTitleKey | undefined { return this._titleKey; }
  get messageKey(): NotificationMessageKey | undefined { return this._messageKey; }
  get params(): NotificationParams | undefined { return this._params; }
  get link(): NotificationLink { return this._link; }
  get read(): boolean { return this._read; }
  get createdAt(): Date { return this._createdAt; }

  markAsRead(): void {
    this._read = true;
  }

  public toPlain(): NotificationPlain {
    return {
      id: this._id.value,
      userId: this._userId.value,
      type: this._type.value,
      title: this._title.value,
      message: this._message.value,
      titleKey: this._titleKey?.value,
      messageKey: this._messageKey?.value,
      params: this._params?.value,
      link: this._link.value,
      read: this._read,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
