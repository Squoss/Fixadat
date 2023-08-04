/*
 * The MIT License
 *
 * Copyright (c) 2021-2023 Squeng AG
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

import { de } from "date-fns/locale"; // en is imported by default
import React, { useContext, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ElectionT } from "./Elections";
import { l10nContext } from "./l10nContext";

registerLocale("de", de); // en is registered by default

interface ElectionCandidatesProps {
  election: ElectionT;
  timeZones: Array<string>;
  saveElectionSchedule: (candidates: Array<string>, timeZone?: string) => void;
}

function tte(s?: string) {
  // trim to empty
  return s?.trim() ?? "";
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
  const [dateTime, setDateTime] = useState<null | Date>(new Date());
  const [timeZone, setTimeZone] = useState(
    props.election.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const timeZones = props.timeZones.map((tz) => (
    <option key={tz} value={tz}>
      {tz}
    </option>
  ));

  const addDateTime = (dateTimeArg: string) => {
    const dts = dateTimes.slice();
    const dta = dateTimeArg.substring(0, dateTimeArg.indexOf("T") + 6) + ":00";
    if (!dts.includes(dta)) {
      dts.push(dta);
      setDateTimes(dts);
    }
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
      props.election.timeZone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone
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

  const changesSaved = () =>
    sameElements(props.election.candidates, dateTimes) &&
    tte(props.election.timeZone) === timeZone;

  return (
    <form className="d-grid gap-4">
      <div className={changesSaved() ? "card" : "card border-warning"}>
        <div className="card-body">
          <h5 className="card-title">
            {localizations["datesAndTimes.instruction"]}
          </h5>
          <div className="row align-items-start">
            <div className="col-sm">
              <div>
                <label htmlFor="timeZoneSelect" className="form-label">
                  {localizations["datesAndTimes.timeZone"]}
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
                <p className="card-text">
                  <i className="bi bi-info-circle-fill"></i>{" "}
                  {localizations["datesAndTimes.timeZoneMotivation"]}
                </p>
              </div>
            </div>
            <div className="col-sm">
              <div>
                <label htmlFor="dateTimeSchedule" className="form-label">
                  {localizations["datesAndTimes"]}
                </label>
                {dateTimes.map((dt) => (
                  <React.Fragment key={dt}>
                    <div className="input-group mb-3">
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="dateTimeSchedule"
                        value={dt}
                        readOnly
                      />
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removeDateTime(dt)}
                      >
                        <i className="bi bi-dash-lg"></i>
                      </button>
                    </div>
                  </React.Fragment>
                ))}
                <div className="input-group mb-3">
                  <p className="card-text">
                    <i className="bi bi-info-circle-fill"></i>{" "}
                    {localizations["datesAndTimes.order"]}
                  </p>
                  <DatePicker
                    selected={dateTime}
                    onChange={(date) => setDateTime(date)}
                    onCalendarClose={() => {
                      if (dateTime !== null) {
                        const localTime = new Date();
                        localTime.setTime(
                          dateTime.getTime() -
                            dateTime.getTimezoneOffset() * 60 * 1000
                        );
                        addDateTime(localTime.toISOString());
                      }
                    }}
                    locale={localizations["locale"]}
                    showTimeSelect
                    timeFormat="p"
                    timeIntervals={15}
                    dateFormat="Pp"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div
              className={
                changesSaved() ? "card-footer" : "card-footer bg-warning"
              }
            >
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button className="btn btn-secondary" onClick={cancelSchedule}>
                  {localizations["revert"]}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveSchedule}
                  disabled={dateTimes.length === 0 || changesSaved()}
                >
                  {localizations["save"]}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ElectionCandidates;
