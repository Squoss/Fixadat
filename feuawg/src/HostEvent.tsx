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
import { NavLink, useLocation } from "react-router-dom";
import { Geo, HostEventType, Visibility } from "./Events";
import HostEventLinks from "./HostEventLinks";
import HostEventRsvps from "./HostEventRsvps";
import HostEventSettings from "./HostEventSettings";
import { l10nContext } from "./l10nContext";

export enum ACTIVE_TAB {
  LINKS = "links",
  RSVPS = "RSVPs",
  SETTINGS = "settings",
}

interface HostEventProps {
  event: HostEventType;
  activeTab: ACTIVE_TAB;
  saveEventText: (name: string, description?: string) => void;
  saveEventSchedule: (dateTime?: string, timeZone?: string) => void;
  saveEventEaPnP1: (
    emailAddressRequired: boolean,
    phoneNumberRequired: boolean,
    plus1Allowed: boolean
  ) => void;
  saveEventVisibility: (visibility: Visibility) => void;
  saveEventLocation: (url?: string, location?: Geo) => void;
  sendLinksReminder: (emailAddress?: string, phoneNumber?: string) => void;
  timeZones: Array<string>;
}

function HostEvent(props: HostEventProps) {
  console.log("HostEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, guestToken, hostToken, name } = props.event;

  const location = useLocation();
  const brandNew = new URLSearchParams(location.search).has("brandNew");

  let content;
  switch (props.activeTab) {
    case ACTIVE_TAB.LINKS:
      content = (
        <HostEventLinks
          id={id}
          hostToken={hostToken}
          guestToken={guestToken}
          sendLinksReminder={props.sendLinksReminder}
        />
      );
      break;
    case ACTIVE_TAB.RSVPS:
      content = <HostEventRsvps event={props.event} />;
      break;
    case ACTIVE_TAB.SETTINGS:
      content = (
        <HostEventSettings
          event={props.event}
          timeZones={props.timeZones}
          saveEventText={props.saveEventText}
          saveEventSchedule={props.saveEventSchedule}
          saveEventLocation={props.saveEventLocation}
          saveEventEaPnP1={props.saveEventEaPnP1}
          saveEventVisibility={props.saveEventVisibility}
        />
      );
      break;
    default:
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustiveCheck: never = props.activeTab;
      return _exhaustiveCheck;
  }

  const brandNewAlert = (
    <div className="alert alert-success" role="alert">
      {localizations["repliesPageCreated"]}
    </div>
  );

  return (
    <React.Fragment>
      <h1>{name}</h1>
      {brandNew ? brandNewAlert : <span></span>}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to={`/events/${id}/settings#${hostToken}`}
          >
            <i className="bi bi-sliders"></i> {localizations["settings"]}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to={`/events/${id}/RSVPs#${hostToken}`}
          >
            <i className="bi bi-person-lines-fill"></i> RSVPs
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to={`/events/${id}/links#${hostToken}`}
          >
            <i className="bi bi-share"></i> {localizations["links"]}
          </NavLink>
        </li>
      </ul>
      {content}
    </React.Fragment>
  );
}

export default HostEvent;
