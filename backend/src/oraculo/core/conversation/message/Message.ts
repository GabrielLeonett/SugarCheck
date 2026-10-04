import { MessageId } from './value-objects/MessageId';
import { MessageContent } from './value-objects/MessageContent';
import { MessageRole } from './value-objects/MessageRole';

interface MessageProps {
  id: MessageId;
  conversationId: string;
  role: MessageRole;
  content: MessageContent;
  createdAt: Date;
}

export interface MessagePlain {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

export class Message {
  private readonly _id: MessageId;
  private readonly _conversationId: string;
  private readonly _role: MessageRole;
  private readonly _content: MessageContent;
  private readonly _createdAt: Date;

  constructor(props: MessageProps) {
    this._id = props.id;
    this._conversationId = props.conversationId;
    this._role = props.role;
    this._content = props.content;
    this._createdAt = props.createdAt;
  }

  get id(): MessageId { return this._id; }
  get conversationId(): string { return this._conversationId; }
  get role(): MessageRole { return this._role; }
  get content(): MessageContent { return this._content; }
  get createdAt(): Date { return this._createdAt; }

  public toPlain(): MessagePlain {
    return {
      id: this._id.value,
      conversationId: this._conversationId,
      role: this._role.value,
      content: this._content.value,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
