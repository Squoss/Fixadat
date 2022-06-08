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

import { Popover } from "bootstrap";
import React, { useContext, useEffect, useState } from "react";
import { ElectionT } from "./Elections";
import { l10nContext } from "./l10nContext";

interface ElectionCandidatesProps {
  election: ElectionT;
  timeZones: Array<string>;
  saveElectionSchedule: (candidates: Array<string>, timeZone?: string) => void;
}

function tte(s?: string) {
  // trim to empty
  return s === undefined ? "" : s.trim();
}

function ttu(s?: string) {
  // trim to undefined
  return s === undefined || s.trim() === "" ? undefined : s.trim();
}

function ElectionCandidates(props: ElectionCandidatesProps) {
  console.log("ElectionCandidates props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const [dateTimes, setDateTimes] = useState<Array<string>>(
    props.election.candidates
  );
  const [dateTime, setDateTime] = useState("");
  const [timeZone, setTimeZone] = useState(
    props.election.timeZone === undefined
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : props.election.timeZone
  );
  const timeZones = props.timeZones.map((tz) => (
    <option key={tz} value={tz}>
      {tz}
    </option>
  ));

  const addDateTime = () => {
    const dts = dateTimes.slice();
    dts.push(dateTime.substring(0, dateTime.indexOf("T") + 6) + ":00");
    setDateTimes(dts);
    setDateTime("");
  };

  const removeDateTime = (dateTimeArg: string) => {
    const dts = dateTimes.filter((dt) => dt !== dateTimeArg);
    setDateTimes(dts);
  };

  const cancelSchedule = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setDateTimes(props.election.candidates.map((dt) => tte(dt)));
    setTimeZone(
      props.election.timeZone === undefined
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : props.election.timeZone
    );
  };

  const saveSchedule = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.saveElectionSchedule(
      dateTimes.map((dt) => tte(dt)),
      ttu(timeZone)
    );
  };

  const sameElements = (arr1: Array<string>, arr2: Array<string>) => {
    const set = new Set([...arr1, ...arr2]);
    return set.size === new Set(arr1).size && set.size === new Set(arr2).size;
  };

  useEffect(() => {
    const popover = new Popover(document.getElementById("popoverButton")!);
  }, []);

  return (
    <form className="d-grid gap-4">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            {localizations["datesAndTimes.instruction"]}
          </h5>
          <div className="row align-items-start">
            <div className="col-sm">
              <div>
                <label htmlFor="timeZoneSelect" className="form-label">
                  {localizations["datesAndTimes.timeZone"]}{" "}
                  <button
                    type="button"
                    id="popoverButton"
                    className="btn btn-sm btn-outline-info"
                    data-bs-toggle="popover"
                    data-bs-trigger="focus"
                    data-bs-placement="bottom"
                    data-bs-content={
                      localizations["datesAndTimes.timeZoneMotivation"]
                    }
                  >
                    <i className="bi bi-info-circle-fill"></i>
                  </button>
                </label>
                <select
                  className="form-select"
                  id="timeZoneSelect"
                  required={false}
                  value={timeZone}
                  onChange={(event) => setTimeZone(event.target.value)}
                >
                  {timeZones}
                </select>
              </div>
            </div>
            <div className="col-sm">
              <div>
                <label htmlFor="dateTimeSchedule" className="form-label">
                  {localizations["datesAndTimes"]}
                </label>
                {dateTimes.map((dt) => (
                  <React.Fragment>
                    <div className="input-group mb-3">
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="dateTimeSchedule"
                        value={dt}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={() => removeDateTime(dt)}
                      >
                        <i className="bi bi-dash-lg"></i>
                      </button>
                    </div>
                  </React.Fragment>
                ))}
                <div className="input-group mb-3">
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="dateTimeSchedule"
                    value={dateTime}
                    onChange={(event) => setDateTime(event.target.value)}
                  />
                  <button
                    className="btn btn-outline-success"
                    type="button"
                    id="button-addon2"
                    disabled={tte(dateTime) === ""}
                    onClick={addDateTime}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                <p className="card-text">
                  {localizations["datesAndTimes.order"]}
                </p>
              </div>
            </div>
            <div className="card-footer">
              {
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    className="btn btn-secondary"
                    onClick={cancelSchedule}
                  >
                    {localizations["revert"]}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={saveSchedule}
                    disabled={
                      (sameElements(props.election.candidates, dateTimes) &&
                        tte(props.election.timeZone) === timeZone) ||
                      dateTimes.length === 0
                    }
                  >
                    {localizations["save"]}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ElectionCandidates;
