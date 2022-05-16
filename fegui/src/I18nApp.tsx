/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { useEffect, useState } from "react";
import { get } from "./fetchJson";
import { l10nContext, Localizations } from "./l10nContext";

interface I18nAppProperties {
  children: React.ReactNode;
}

function I18nApp(props: I18nAppProperties) {
  console.log("I18nApp props: " + JSON.stringify(props));

  const [localizations, setLocalizations] = useState<Localizations>({});

  useEffect(() => {
    const fetchLocalizations = () =>
      get<Localizations>("/iapi/l10nMessages", "")
        .then((responseJson) => {
          console.debug(responseJson.status);
          console.debug(responseJson.parsedBody);
          setLocalizations(responseJson.parsedBody!);
        })
        .catch((error) => console.error(`failed to get time zones: ${error}`));

    fetchLocalizations();
  }, []);

  return (
    <React.Fragment>
      {Object.keys(localizations).length === 0 ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading localizations …</span>
        </div>
      ) : (
        <l10nContext.Provider value={localizations}>
          {props.children}
        </l10nContext.Provider>
      )}
    </React.Fragment>
  );
}

export default I18nApp;
