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

import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import ElectionCandidates from "./ElectionCandidates";
import ElectionLinks from "./ElectionLinks";
import { Availability, ElectionT, Visibility } from "./Elections";
import ElectionSettings from "./ElectionSettings";
import ElectionTally from "./ElectionTally";
import ElectionTexts from "./ElectionTexts";
import { l10nContext } from "./l10nContext";

export enum ACTIVE_TAB {
  TEXTS = "name and description",
  CANDIDATES = "dates and times",
  LINKS = "links",
  VOTES = "votes",
  SETTINGS = "settings",
}

interface ElectionTabsProps {
  election: ElectionT;
  token: string;
  activeTab: ACTIVE_TAB;
  saveElectionText: (name: string, description?: string) => void;
  saveElectionSchedule: (candidates: Array<string>, timeZone?: string) => void;
  saveElectionEaPnP1: (
    emailAddressRequired: boolean,
    phoneNumberRequired: boolean,
    plus1Allowed: boolean
  ) => void;
  saveElectionVisibility: (visibility: Visibility) => void;
  sendLinksReminder: (emailAddress?: string, phoneNumber?: string) => void;
  timeZones: Array<string>;
  saveVote: (
    name: string,
    availability: Map<string, Availability>,
    timeZone?: string
  ) => void;
  deleteElection: () => void;
  isOrganizer: boolean;
  isBrandNew: boolean;
}

function ElectionTabs(props: ElectionTabsProps) {
  console.log("ElectionTabs props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, voterToken, organizerToken, name } = props.election;

  let content;
  switch (props.activeTab) {
    case ACTIVE_TAB.TEXTS:
      content = (
        <ElectionTexts
          election={props.election}
          saveElectionText={props.saveElectionText}
        />
      );
      break;
    case ACTIVE_TAB.CANDIDATES:
      content = (
        <ElectionCandidates
          election={props.election}
          timeZones={props.timeZones}
          saveElectionSchedule={props.saveElectionSchedule}
        />
      );
      break;
    case ACTIVE_TAB.LINKS:
      content = (
        <ElectionLinks
          id={id}
          organizerToken={organizerToken}
          voterToken={voterToken}
          sendLinksReminder={props.sendLinksReminder}
        />
      );
      break;
    case ACTIVE_TAB.VOTES:
      content = (
        <ElectionTally
          election={props.election}
          token={props.token}
          timeZones={props.timeZones}
          saveVote={props.saveVote}
        />
      );
      break;
    case ACTIVE_TAB.SETTINGS:
      content = (
        <ElectionSettings
          election={props.election}
          saveElectionVisibility={props.saveElectionVisibility}
          deleteElection={props.deleteElection}
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
      <h4 className="alert-heading">{localizations["electionPageCreated"]}</h4>
      <p>{localizations["firstThingsFirst"]}</p>
      <hr />
      <p className="mb-0">{localizations["rememberTheMilk"]}</p>
    </div>
  );

  if (props.isOrganizer) {
    return (
      <React.Fragment>
        <h1>{name}</h1>
        {props.isBrandNew ? brandNewAlert : <span></span>}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/texts#${organizerToken}`}
            >
              <i className="bi bi-body-text"></i> {localizations["texts"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/dats#${organizerToken}`}
            >
              <i className="bi bi-calendar2-range"></i>{" "}
              {localizations["datesAndTimes"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/links#${organizerToken}`}
            >
              <i className="bi bi-share"></i> {localizations["links"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/tally#${organizerToken}`}
            >
              <i className="bi bi-person-lines-fill"></i>{" "}
              {localizations["votes"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/settings#${organizerToken}`}
            >
              <i className="bi bi-sliders"></i> {localizations["settings"]}
            </NavLink>
          </li>
        </ul>
        {content}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <h1>{name}</h1>
        {content}
      </React.Fragment>
    );
  }
}

export default ElectionTabs;
