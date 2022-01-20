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
  useMatch,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Attendance,
  EventType,
  Geo,
  GuestEventType,
  HostEventType,
  Visibility,
} from "./Events";
import { get, patch, post, put } from "./fetchJson";
import GuestEvent from "./GuestEvent";
import HostEvent, { ACTIVE_TAB } from "./HostEvent";
import NotFound from "./NotFound";

function Event(props: {}) {
  console.log("Event props: " + JSON.stringify(props));

  const id = useParams().event;
  console.debug(`event ID is ${id}`);
  const location = useLocation();
  const token = location.hash;
  console.debug(`event token is ${token}`);
  let [searchParams, setSearchParams] = useSearchParams();
  const brandNew = searchParams.has("brandNew");
  console.debug(`event is brand new ${brandNew}`);
  const timeZone = searchParams.get("timeZone");
  const view = useMatch<string, string>({ path: "/events/:id/:hostish" })
    ?.params.hostish
    ? "host"
    : searchParams.get("view");
  console.debug(view);

  const [event, setEvent] = useState<EventType | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);
  const [timeZones, setTimeZones] = useState<Array<string>>([]);

  useEffect(() => {
    const getEvent = () =>
      get<EventType>(
        `/iapi/events/${id}?${view !== null ? "&view=" + view : ""}${
          timeZone != null ? "&timeZone=" + timeZone : ""
        }`,
        token.substring(1)
      )
        .then((responseJson) => {
          console.debug(responseJson.status);
          console.debug(responseJson.parsedBody);
          setResponseStatusCode(responseJson.status);
          if (responseJson.status === 200) {
            setEvent(responseJson.parsedBody);
          }
        })
        .catch((error) => console.error(`failed to get event: ${error}`));

    if (token !== "") {
      getEvent();
    }
  }, [id, token, view, timeZone]);

  useEffect(() => {
    const getTimeZones = () =>
      get<Array<string>>("/timeZones", "")
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

  const saveEventText = (name: string, description?: string) =>
    put<EventType>(`/iapi/events/${id}/text`, token.substring(1), {
      name,
      description,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setEvent({ ...event, name, description } as EventType);
        }
      })
      .catch((error) => console.error(`failed to put event text: ${error}`));

  const saveEventSchedule = (date?: string, time?: string, tz?: string) =>
    put<EventType>(`/iapi/events/${id}/schedule`, token.substring(1), {
      date,
      time,
      tz,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setEvent({ ...event, date, time, timeZone } as EventType);
        }
      })
      .catch((error) =>
        console.error(`failed to put event schedule: ${error}`)
      );

  const saveEventLocation = (url?: string, geo?: Geo) =>
    put<EventType>(`/iapi/events/${id}/location`, token.substring(1), {
      url,
      geo,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setEvent({ ...event, url, geo } as EventType);
        }
      })
      .catch((error) =>
        console.error(`failed to put event location: ${error}`)
      );

  const saveEventEaPnP1 = (
    emailAddressRequired: boolean,
    phoneNumberRequired: boolean,
    plus1Allowed: boolean
  ) =>
    patch<EventType>(`/iapi/events/${id}`, token.substring(1), {
      emailAddressRequired,
      phoneNumberRequired,
      plus1Allowed,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setEvent({
            ...event,
            emailAddressRequired,
            phoneNumberRequired,
            plus1Allowed,
          } as EventType);
        }
      })
      .catch((error) => console.error(`failed to patch event: ${error}`));

  const saveEventVisibility = (visibility: Visibility) =>
    put<EventType>(`/iapi/events/${id}/visibility`, token.substring(1), {
      visibility,
    })
      .then((responseJson) => {
        console.debug(responseJson.status);
        if (responseJson.status !== 204) {
          throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
        } else {
          setEvent({ ...event, visibility } as EventType);
        }
      })
      .catch((error) =>
        console.error(`failed to put event visibility: ${error}`)
      );

  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) =>
    post<void>(`/iapi/events/${id}/reminders`, token.substring(1), {
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
        console.error(`failed to post event reminders: ${error}`)
      );

  const saveRsvp = (
    name: string,
    attendance: Attendance,
    emailAddress?: string,
    phoneNumber?: string
  ) =>
    post<void>(`/iapi/events/${id}/RSVPs`, token.substring(1), {
      name,
      attendance,
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
        console.error(`failed to post event reminders: ${error}`)
      );

  if (token === "") {
    return <p>Dude, where's my token?!</p>;
  }

  if (event === undefined && responseStatusCode === 200) {
    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading event …</span>
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
              "host" === view ? (
                brandNew ? (
                  <Navigate to={`/events/${id}/links?brandNew=true${token}`} />
                ) : (
                  <Navigate to={`/events/${id}/RSVPs${token}`} />
                )
              ) : (
                <GuestEvent
                  event={event as GuestEventType}
                  timeZones={timeZones}
                  saveRsvp={saveRsvp}
                />
              )
            }
          />
          <Route
            path="settings"
            element={
              <HostEvent
                activeTab={ACTIVE_TAB.SETTINGS}
                event={event as HostEventType}
                saveEventText={saveEventText}
                saveEventSchedule={saveEventSchedule}
                saveEventLocation={saveEventLocation}
                saveEventEaPnP1={saveEventEaPnP1}
                saveEventVisibility={saveEventVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
              />
            }
          />
          <Route
            path="RSVPs"
            element={
              <HostEvent
                activeTab={ACTIVE_TAB.RSVPS}
                event={event as HostEventType}
                saveEventText={saveEventText}
                saveEventSchedule={saveEventSchedule}
                saveEventLocation={saveEventLocation}
                saveEventEaPnP1={saveEventEaPnP1}
                saveEventVisibility={saveEventVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
              />
            }
          />
          <Route
            path="links"
            element={
              <HostEvent
                activeTab={ACTIVE_TAB.LINKS}
                event={event as HostEventType}
                saveEventText={saveEventText}
                saveEventSchedule={saveEventSchedule}
                saveEventLocation={saveEventLocation}
                saveEventEaPnP1={saveEventEaPnP1}
                saveEventVisibility={saveEventVisibility}
                sendLinksReminder={sendLinksReminder}
                timeZones={timeZones}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }
}

export default Event;
