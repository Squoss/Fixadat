/*
 * The MIT License
 *
 * Copyright (c) 2021 Squeng AG
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
import { Attendance, GuestEventType } from "./Events";
import GuestEventRsvp from "./GuestEventRsvp";
import { l10nContext, Localizations } from "./l10nContext";

interface GuestEventProps {
  event: GuestEventType;
  timeZones: Array<string>;
  saveRsvp: (
    name: string,
    attendance: Attendance,
    emailAddress?: string,
    phoneNumber?: string
  ) => void;
}

function prettyLocalDateTimeString(
  localizations: Localizations,
  date?: string,
  time?: string,
  timeZone?: string
) {
  if (date && time) {
    return (
      new Date(`${date}T${time}`).toLocaleString(localizations["locale"]) +
      (timeZone ? ` (${timeZone})` : "")
    );
  } else if (date) {
    return new Date(date).toLocaleDateString(localizations["locale"]);
  } else if (time) {
    return new Date(
      `${new Date().toISOString().substring(0, 10)}T${time}`
    ).toLocaleTimeString(localizations["locale"]);
  } else {
    return localizations["settings.seeInvitation"];
  }
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, guestToken, name, description, date, time, timeZone, geo } =
    props.event;
  const timeZones = props.timeZones.map((tz) => (
    <li key={tz}>
      <a
        className="dropdonw-item"
        href={`/events/${id}?timeZone=${tz}#${guestToken}`}
      >
        {tz}
      </a>
    </li>
  ));

  return (
    <React.Fragment>
      <h1>{name}</h1>
      <div className="d-grid gap-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{localizations["settings.what"]}</h5>
            {description
              ? description
                  .split("\n")
                  .map((line) => <p className="card-Text">{line}</p>)
              : localizations["settings.seeInvitation"]}{" "}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{localizations["settings.when"]}</h5>
            <p className="card-Text">
              {prettyLocalDateTimeString(localizations, date, time, timeZone)}
            </p>
          </div>
          {timeZone ? (
            <div className="card-footer">
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-link dropdown-toggle"
                  type="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {localizations["convertToDifferentTimeZone"]}
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuLink"
                >
                  {timeZones}
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{localizations["settings.where"]}</h5>
              <p className="card-text">
                {localizations["settings.seeInvitation"]}
              </p>
          </div>
        </div>
      </div>
      <h2>Anmeldung / Abmeldung</h2>
      <GuestEventRsvp event={props.event} saveRsvp={props.saveRsvp} />
    </React.Fragment>
  );
}

export default GuestEvent;
