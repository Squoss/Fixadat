export enum Visibility {
  PUBLIC = "Public",
  PROTECTED = "Protected",
  PRIVATE = "Private"
}

export interface EventType {
  id: number;
  guestToken: string;
  name: string;
  description?: string;
  date?: string;
  time?: string;
  timeZone?: string;
  emailAddressRequired: boolean;
  phoneNumberRequired: boolean;
  plus1Allowed: boolean;
  visibility: Visibility;
}

export interface GuestEventType extends EventType {
}

export interface HostEventType extends EventType {
  hostToken: string
}
