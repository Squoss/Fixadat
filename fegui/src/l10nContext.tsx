import React from "react";

export interface Localizations {
  [key: string]: string;
}

export const l10nContext = React.createContext<Localizations>({});
