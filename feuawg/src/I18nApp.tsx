import React, { useState, useEffect } from "react";
import App from "./App";

import { get } from "./fetchJson";
import { Localizations, l10nContext } from "./l10nContext";

function I18nApp(props: {}) {
  console.log("I18nApp props: " + JSON.stringify(props));

  const [localizations, setLocalizations] = useState<Localizations>({});

  useEffect(() => {
    const fetchLocalizations = async () => {
      try {
        const responseJson = await get<Localizations>("/jsonMessages", "").then();
        setLocalizations(responseJson.parsedBody!);
        console.debug(responseJson.status);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLocalizations();
  }, []);

  return (
    <React.Fragment>
      {localizations === {} ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading localizations …</span>
        </div>
      ) : (
        <l10nContext.Provider value={localizations}>
          <App />
        </l10nContext.Provider>
      )}
    </React.Fragment>
  );
}

export default I18nApp;
