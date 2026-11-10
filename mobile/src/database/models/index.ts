// src/database/models/index.ts
import CaminoProgreso from './CaminoProgreso';
import ContactEmergence from './ContactEmergence';
import Conversation from './Conversation';
import Glucose from './Glucose';
import HbA1c from './HbA1c';
import Imc from './Imc';
import Insulina from './Insulina';
import Message from './Message';
import Preference from './Preference';
import User from './User';

export {
  CaminoProgreso,
  ContactEmergence,
  Conversation,
  Glucose,
  HbA1c,
  Imc,
  Insulina,
  Message,
  Preference,
  User,
};

export const modelClasses = [
  User,
  Preference,
  ContactEmergence,
  Imc,
  Glucose,
  HbA1c,
  Conversation,
  Message,
  Insulina,
  CaminoProgreso,
];
