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
import { ElectionT } from "./Electioins";
import { l10nContext } from "./l10nContext";

interface ElectionTextsProps {
  election: ElectionT;
  saveElectionText: (name: string, description?: string) => void;
}

function tte(s?: string) {
  // trim to empty
  return s === undefined ? "" : s.trim();
}

function ttu(s?: string) {
  // trim to undefined
  return s === undefined || s.trim() === "" ? undefined : s.trim();
}

function ElectionTexts(props: ElectionTextsProps) {
  console.log("ElectionTexts props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const [name, setName] = useState(props.election.name);
  const [description, setDescription] = useState(
    tte(props.election.description)
  );

  const cancelText = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setName(props.election.name);
    setDescription(tte(props.election.description));
  };

  const saveText = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.saveElectionText(name.trim(), ttu(description));
  };

  return (
    <form className="d-grid gap-4">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            Provide a title for and optionally a description of the group event
            (e.g., whether it takes place online or offline, how long it takes,
            etc.).
          </h5>
          <div>
            <label htmlFor="nameText" className="form-label">
              {localizations["settings.name"]}
            </label>
            <input
              type="text"
              className="form-control"
              id="nameText"
              placeholder="Election Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="descriptionText" className="form-label">
              {localizations["settings.description"]}
            </label>
            <textarea
              className="form-control"
              id="descriptionText"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="card-footer">
          {
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelText}>
                {localizations["revert"]}
              </button>
              <button
                className="btn btn-primary"
                onClick={saveText}
                disabled={
                  name === "" ||
                  (props.election.name === name &&
                    tte(props.election.description) === description)
                }
              >
                {localizations["save"]}
              </button>
            </div>
          }
        </div>
      </div>
    </form>
  );
}

export default ElectionTexts;
