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

import React, { useContext, useState } from "react";
import { ElectionT, Visibility } from "./Electioins";
import { l10nContext } from "./l10nContext";

interface ElectionSettingsProps {
  election: ElectionT;
  saveElectionVisibility: (visibility: Visibility) => void;
}

function ElectionSettings(props: ElectionSettingsProps) {
  console.log("ElectionSettings props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const [visibility, setVisibility] = useState<Visibility>(
    props.election.visibility
  );

  const cancelVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setVisibility(props.election.visibility);
  };

  const saveVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    props.saveElectionVisibility(visibility);
  };

  return (
    <React.Fragment>
      <form className="d-grid gap-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Visibility</h5>
            <select
              className="form-select"
              id="visibilitySelect"
              value={visibility}
              onChange={(event) =>
                Object.entries(Visibility).forEach((v) => {
                  if (v[1] === event.target.value) {
                    setVisibility(v[1]);
                  }
                })
              }
            >
              <option value={Visibility.PUBLIC}>Read/Write</option>
              <option value={Visibility.PROTECTED}>Read-only</option>
              <option value={Visibility.PRIVATE}>???</option>
            </select>
          </div>
          <div className="card-footer">
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelVisibility}>
                {localizations["revert"]}
              </button>
              <button
                className="btn btn-primary"
                onClick={saveVisibility}
                disabled={props.election.visibility === visibility}
              >
                {localizations["save"]}
              </button>
            </div>
          </div>
        </div>
      </form>
      <button className="btn btn-danger" onClick={() => alert("Hello, world!")}>
        DELETE
      </button>
    </React.Fragment>
  );
}

export default ElectionSettings;
