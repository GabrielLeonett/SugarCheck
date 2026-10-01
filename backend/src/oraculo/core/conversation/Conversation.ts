import { UserId } from '../../../shared/core/value-objects/UserId';
import { ConversationId } from './value-objects/ConversationId';
import { ConversationTitle } from './value-objects/ConversationTitle';
import { Message, MessagePlain } from './message/Message';

interface ConversationProps {
  id: ConversationId;
  userId: UserId;
  title: ConversationTitle;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface ConversationPlain {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MessagePlain[];
}

export class Conversation {
  private readonly _id: ConversationId;
  private readonly _userId: UserId;
  private _title: ConversationTitle;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _messages: Message[];

  constructor(props: ConversationProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._title = props.title;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._messages = props.messages ?? [];
  }

  get id(): ConversationId { return this._id; }
  get userId(): UserId { return this._userId; }
  get title(): ConversationTitle { return this._title; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get messages(): Message[] { return [...this._messages]; }

  public belongsTo(userId: string): boolean {
    return this._userId.value === userId;
  }

  public rename(title: ConversationTitle): void {
    this._title = title;
    this._updatedAt = new Date();
  }

  public toPlain(): ConversationPlain {
    return {
      id: this._id.value,
      userId: this._userId.value,
      title: this._title.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      messages: this._messages.map((m) => m.toPlain()),
    };
  }
}
