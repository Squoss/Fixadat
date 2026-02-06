/*
 * The MIT License
 *
 * Copyright (c) 2021-2026 Squeng AG
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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ElectionEntity } from "../entities/ElectionEntity";
import { HttpError } from "../HttpError";
import ElectionTabs from "./ElectionTabs";
import { ACTIVE_TAB } from "../props/ElectionTabsProps";
import { fetchResource, Method } from "../fetchJson";
import NotFound from "./NotFound";
import { factoryContext } from "../factoryContext";

function Election(props: {}) {
  console.log("Election props: " + JSON.stringify(props));

  const factory = useContext(factoryContext)!;
  const id = useParams().election;
  const location = useLocation();
  const token = location.hash;
  const [searchParams] = useSearchParams();
  const brandNew = searchParams.has("brandNew");
  const tz = searchParams.get("timeZone");

  const [election, setElection] = useState<ElectionEntity | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);
  const [timeZones, setTimeZones] = useState<Array<string>>([]);

  const getElection = useCallback(() => {
    if (token === "") {
      return;
    }

    factory
      .recreateElection(id!, token.substring(1), tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
      .then((election) => {
        setResponseStatusCode(200);
        setElection(election);
      })
      .catch((error) => {
        if (error instanceof HttpError) {
          setResponseStatusCode(error.status);
        }
        console.error(`failed to get election: ${error}`);
      });
  }, [id, token, tz]);

  useEffect(() => {
    getElection();
  }, [getElection]);

  useEffect(() => {
    const getTimeZones = () =>
      fetchResource<Array<string>>(Method.Get, "/iapi/timeZones")
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`HTTP status ${response.status} instead of 200`);
          } else {
            setTimeZones(response.parsedBody!);
          }
        })
        .catch((error) => console.error(`failed to get time zones: ${error}`));

    getTimeZones();
  }, []);

  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) =>
    fetchResource(Method.Post, `/iapi/elections/${id}/reminders`, token.substring(1), {
      emailAddress,
      phoneNumber,
    })
      .then((response) => {
        if (response.status !== 204) {
          throw new Error(`HTTP status ${response.status} instead of 204`);
        }
      })
      .catch((error) => console.error(`failed to post election reminders: ${error}`));

  const onElectionDeleted = () => {
    setElection(undefined);
    setResponseStatusCode(404);
  };

  if (token === "") {
    return <p>Dude, where's my token?!</p>;
  }

  if (election === undefined && responseStatusCode === 200) {
    return (
      <output className="spinner-border">
        <span className="visually-hidden">Loading election …</span>
      </output>
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
  } else if (election !== undefined) {
    return (
      <React.Fragment>
        <title>{election.name}</title>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              index
              element={
                token.substring(1) === election.organizerToken && brandNew ? (
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
                  election={election}
                  token={token.substring(1)}
                  onElectionChanged={setElection}
                  sendLinksReminder={sendLinksReminder}
                  timeZones={timeZones}
                  onElectionDeleted={onElectionDeleted}
                  isOrganizer={token.substring(1) === election.organizerToken}
                  isBrandNew={brandNew}
                />
              }
            />
            <Route
              path="dats"
              element={
                <ElectionTabs
                  activeTab={ACTIVE_TAB.CANDIDATES}
                  election={election}
                  token={token.substring(1)}
                  onElectionChanged={setElection}
                  sendLinksReminder={sendLinksReminder}
                  timeZones={timeZones}
                  onElectionDeleted={onElectionDeleted}
                  isOrganizer={token.substring(1) === election.organizerToken}
                  isBrandNew={brandNew}
                />
              }
            />
            <Route
              path="links"
              element={
                <ElectionTabs
                  activeTab={ACTIVE_TAB.LINKS}
                  election={election}
                  token={token.substring(1)}
                  onElectionChanged={setElection}
                  sendLinksReminder={sendLinksReminder}
                  timeZones={timeZones}
                  onElectionDeleted={onElectionDeleted}
                  isOrganizer={token.substring(1) === election.organizerToken}
                  isBrandNew={brandNew}
                />
              }
            />
            <Route
              path="tally"
              element={
                <ElectionTabs
                  activeTab={ACTIVE_TAB.VOTES}
                  election={election}
                  token={token.substring(1)}
                  onElectionChanged={setElection}
                  sendLinksReminder={sendLinksReminder}
                  timeZones={timeZones}
                  onElectionDeleted={onElectionDeleted}
                  isOrganizer={token.substring(1) === election.organizerToken}
                  isBrandNew={brandNew}
                />
              }
            />
            <Route
              path="settings"
              element={
                <ElectionTabs
                  activeTab={ACTIVE_TAB.SETTINGS}
                  election={election}
                  token={token.substring(1)}
                  onElectionChanged={setElection}
                  sendLinksReminder={sendLinksReminder}
                  timeZones={timeZones}
                  onElectionDeleted={onElectionDeleted}
                  isOrganizer={token.substring(1) === election.organizerToken}
                  isBrandNew={brandNew}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </React.Fragment>
    );
  } else {
    return (
      <dl>
        <dt>assert false</dt>
        <dd>
          election is {election} and responseStatusCode is {responseStatusCode}
        </dd>
      </dl>
    );
  }
}

export default Election;
