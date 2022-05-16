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

import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Availability, ElectionT, Visibility } from "./Electioins";
import ElectionTabs, { ACTIVE_TAB } from "./ElectionTabs";
import { get, patch, post, put } from "./fetchJson";
import NotFound from "./NotFound";

function Election(props: {}) {
  console.log("Election props: " + JSON.stringify(props));

  const id = useParams().election;
  console.debug(`election ID is ${id}`);
  const location = useLocation();
  const token = location.hash;
  console.debug(`election token is ${token}`);
  let [searchParams, setSearchParams] = useSearchParams();
  const brandNew = searchParams.has("brandNew");
  console.debug(`election is brand new ${brandNew}`);
  const tz = searchParams.get("timeZone");

  const [election, setElection] = useState<ElectionT | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);
  const [timeZones, setTimeZones] = useState<Array<string>>([]);

  const getElection = () =>
    get<ElectionT>(
      `/iapi/elections/${id}?${tz != null ? "timeZone=" + tz : ""}`,
      token.substring(1)
    )
      .then((responseJson) => {
        console.debug(responseJson.status);
        console.debug(responseJson.parsedBody);
        setResponseStatusCode(responseJson.status);
        if (responseJson.status === 200) {
          setElection(responseJson.parsedBody);
        }
      })
      .catch((error) => console.error(`failed to get election: ${error}`));

  useEffect(() => {
    if (token !== "") {
      getElection();
    }
  }, [id, token, tz]);

  useEffect(() => {
    const getTimeZones = () =>
      get<Array<string>>("/iapi/timeZones", "")
        .then((responseJson) => {
          console.debug(responseJson.status);
          console.debug(responseJson.parsedBody);
          if (responseJson.status === 200) {
            setTimeZones(responseJson.parsedBody!);
          }
        })
        .catch((error) => console.error(`failed to get time zones: ${error}`));

    getTimeZones();
  }, []);

  const saveElectionText = (name: string, description?: string) =>
    put<ElectionT>(`/iapi/elections/${id}/text`, token.substring(1), {
      name,
      description,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setElection({ ...election, name, description } as ElectionT);
        }
      })
      .catch((error) => console.error(`failed to put election text: ${error}`));

  const saveElectionSchedule = (candidates: Array<string>, timeZone?: string) =>
    put<ElectionT>(`/iapi/elections/${id}/nominees`, token.substring(1), {
      candidates,
      timeZone,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setElection({ ...election, candidates, timeZone } as ElectionT);
        }
      })
      .catch((error) =>
        console.error(`failed to put election schedule: ${error}`)
      );

  const saveElectionEaPnP1 = (
    emailAddressRequired: boolean,
    phoneNumberRequired: boolean,
    plus1Allowed: boolean
  ) =>
    patch<ElectionT>(`/iapi/elections/${id}`, token.substring(1), {
      emailAddressRequired,
      phoneNumberRequired,
      plus1Allowed,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setElection({
            ...election,
            emailAddressRequired,
            phoneNumberRequired,
            plus1Allowed,
          } as ElectionT);
        }
      })
      .catch((error) => console.error(`failed to patch election: ${error}`));

  const saveElectionVisibility = (visibility: Visibility) =>
    put<ElectionT>(`/iapi/elections/${id}/visibility`, token.substring(1), {
      visibility,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setElection({ ...election, visibility } as ElectionT);
        }
      })
      .catch((error) =>
        console.error(`failed to put election visibility: ${error}`)
      );

  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) =>
    post<void>(`/iapi/elections/${id}/reminders`, token.substring(1), {
      emailAddress,
      phoneNumber,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        }
      })
      .catch((error) =>
        console.error(`failed to post election reminders: ${error}`)
      );

  const saveVote = (
    name: string,
    availability: Map<string, Availability>,
    timeZone?: string
  ) => {
    post<void>(`/iapi/elections/${id}/votes`, token.substring(1), {
      name,
      timeZone,
      availability: Object.fromEntries(availability),
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          getElection();
        }
      })
      .catch((error) =>
        console.error(`failed to post election reminders: ${error}`)
      );
  };

  if (token === "") {
    return <p>Dude, where's my token?!</p>;
  }

  if (election === undefined && responseStatusCode === 200) {
    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading election …</span>
      </div>
    );
  } else if (responseStatusCode !== 200) {
    switch (responseStatusCode) {
      case 403:
        return <p>Forbidden</p>;
      case 404:
        return <p>Not Found</p>;
      case 410:
        return <p>Gone</p>;
      default:
        return <p>{responseStatusCode}</p>;
    }
  } else {
    return (
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route
            index
            element={
              token.substring(1) === election!.organizerToken && brandNew ? (
                <Navigate to={`/elections/${id}/texts?brandNew=true${token}`} />
              ) : (
                <Navigate to={`/elections/${id}/tally${token}`} />
              )
            }
          />
          <Route
            path="texts"
            element={
              <ElectionTabs
                activeTab={ACTIVE_TAB.TEXTS}
                election={election as ElectionT}
                token={token.substring(1)}
                saveElectionText={saveElectionText}
                saveElectionSchedule={saveElectionSchedule}
                saveElectionEaPnP1={saveElectionEaPnP1}
                saveElectionVisibility={saveElectionVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
                saveVote={saveVote}
                isOrganizer={token.substring(1) === election!.organizerToken}
                isBrandNew={brandNew}
              />
            }
          />
          <Route
            path="dats"
            element={
              <ElectionTabs
                activeTab={ACTIVE_TAB.CANDIDATES}
                election={election as ElectionT}
                token={token.substring(1)}
                saveElectionText={saveElectionText}
                saveElectionSchedule={saveElectionSchedule}
                saveElectionEaPnP1={saveElectionEaPnP1}
                saveElectionVisibility={saveElectionVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
                saveVote={saveVote}
                isOrganizer={token.substring(1) === election!.organizerToken}
                isBrandNew={brandNew}
              />
            }
          />
          <Route
            path="links"
            element={
              <ElectionTabs
                activeTab={ACTIVE_TAB.LINKS}
                election={election as ElectionT}
                token={token.substring(1)}
                saveElectionText={saveElectionText}
                saveElectionSchedule={saveElectionSchedule}
                saveElectionEaPnP1={saveElectionEaPnP1}
                saveElectionVisibility={saveElectionVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
                saveVote={saveVote}
                isOrganizer={token.substring(1) === election!.organizerToken}
                isBrandNew={brandNew}
              />
            }
          />
          <Route
            path="tally"
            element={
              <ElectionTabs
                activeTab={ACTIVE_TAB.VOTES}
                election={election as ElectionT}
                token={token.substring(1)}
                saveElectionText={saveElectionText}
                saveElectionSchedule={saveElectionSchedule}
                saveElectionEaPnP1={saveElectionEaPnP1}
                saveElectionVisibility={saveElectionVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
                saveVote={saveVote}
                isOrganizer={token.substring(1) === election!.organizerToken}
                isBrandNew={brandNew}
              />
            }
          />
          <Route
            path="settings"
            element={
              <ElectionTabs
                activeTab={ACTIVE_TAB.SETTINGS}
                election={election as ElectionT}
                token={token.substring(1)}
                saveElectionText={saveElectionText}
                saveElectionSchedule={saveElectionSchedule}
                saveElectionEaPnP1={saveElectionEaPnP1}
                saveElectionVisibility={saveElectionVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
                saveVote={saveVote}
                isOrganizer={token.substring(1) === election!.organizerToken}
                isBrandNew={brandNew}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }
}

export default Election;
