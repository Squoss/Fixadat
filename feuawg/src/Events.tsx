export enum Visibility {
  PUBLIC = "Public",
  PROTECTED = "Protected",
  PRIVATE = "Private"
}

export interface Eventt {
  id: number;
  guestToken: string;
  name: string;
  description: string | undefined;
  emailAddressRequired: boolean;
  phoneNumberRequired: boolean;
  plus1Allowed: boolean;
  visibility: Visibility;
}

export interface GuestEventt extends Eventt {
}

export interface HostEventt extends Eventt {
  hostToken: string
}
