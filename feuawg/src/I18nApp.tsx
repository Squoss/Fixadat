import React, { useEffect, useState } from "react";
import App from "./App";
import { get } from "./fetchJson";
import { l10nContext, Localizations } from "./l10nContext";


function I18nApp(props: {}) {
  console.log("I18nApp props: " + JSON.stringify(props));

  const [localizations, setLocalizations] = useState<Localizations>({});

  useEffect(() => {
    const fetchLocalizations = () => get<Localizations>("/jsonMessages", "").then(responseJson => {
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      setLocalizations(responseJson.parsedBody!);
    }).catch(error => console.error(`failed to get time zones: ${error}`));

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
