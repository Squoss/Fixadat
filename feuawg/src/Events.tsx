export interface Geo {
  name?: string;
  longitude: number;
  latitude: number;
}

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
  url?: string;
  geo?: Geo;
  emailAddressRequired: boolean;
  phoneNumberRequired: boolean;
  plus1Allowed: boolean;
  visibility: Visibility;
}

export interface GuestEventType extends EventType {
}

export enum Attendance {
  NOT = "Not",
  ALONE = "Alone",
  WITHPLUS1 = "WithPlus1"
}

export interface Rsvp {
  guestToken: string;
  name: string;
  emailAddress?: string;
  phoneNumber?: string;
  attendance: Attendance;
}

export interface HostEventType extends EventType {
  created: Date;
  hostToken: string;
  updated: Date;
  rsvps: Array<Rsvp>;
}
