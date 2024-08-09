/*
 * The MIT License
 *
 * Copyright (c) 2021-2024 Squeng AG
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

import React, { useContext } from "react";
import { l10nContext } from "./l10nContext";

function Prices(props: {}) {
  console.log("Prices props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  return (
    <React.Fragment>
      <h1>{localizations["prices"]}</h1>
      <div className="row align-items-center">
        <div className="col">
          <p
            dangerouslySetInnerHTML={{
              __html: localizations["HTML.teachingAid"],
            }}
          ></p>
          <p>{localizations["readMe"]}</p>
        </div>
        <div className="col">
          <iframe
            title="Leanpub"
            width="200"
            height="400"
            src="https://leanpub.com/JKS/embed"
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Prices;
