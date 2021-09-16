import { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { EventType, Geo, GuestEventType, HostEventType, Visibility } from './Events';
import { get, patch, post, put } from './fetchJson';
import GuestEventComponent from './GuestEventComponent';
import HostEventComponent, { ACTIVE_TAB } from './HostEventComponent';
import NotFound from './NotFound';


function EventComponent(props: {}) {
  console.log("Event props: " + JSON.stringify(props));

  const location = useLocation();
  const id = useRouteMatch<{ id: string }>({ path: "/events/:id" })!.params.id;
  console.debug(id);
  const token = location.hash;
  console.debug(token);
  const urlSearchParams = new URLSearchParams(location.search)
  const brandNew = urlSearchParams.has("brandNew");
  const timeZone = urlSearchParams.get("timeZone");
  const view = useRouteMatch<{ id: string; hostish: string }>({ path: "/events/:id/:hostish" })?.params.hostish ? "host" : urlSearchParams.get("view");
  console.debug(view);

  const [event, setEvent] = useState<EventType | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);
  const [timeZones, setTimeZones] = useState<Array<string>>([]);

  useEffect(() => {
    const getEvent = () => get<EventType>(`/iapi/events/${id}?${view !== null ? "&view=" + view : ""}${timeZone != null ? "&timeZone=" + timeZone : ""}`, token.substring(1)).then(responseJson => {
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      setResponseStatusCode(responseJson.status);
      if (responseJson.status === 200) {
        setEvent(responseJson.parsedBody);
      }
    }).catch(error => console.error(`failed to get event: ${error}`));

    if (token !== "") {
      getEvent();
    }
  }, [id, token, view, timeZone]);

  useEffect(() => {
    const getTimeZones = () => get<Array<string>>("/timeZones", "").then(responseJson => {
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      if (responseJson.status === 200) {
        setTimeZones(responseJson.parsedBody!);
      }
    }).catch(error => console.error(`failed to get time zones: ${error}`));

    getTimeZones();
  }, []);

  const saveEventText = (name: string, description?: string) => put<EventType>(`/iapi/events/${id}/text`, token.substring(1), { name, description }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    } else {
      setEvent({ ...event, name, description } as EventType)
    }
  }).catch(error => console.error(`failed to put event text: ${error}`));

  const saveEventSchedule = (date?: string, time?: string, timeZone?: string) => put<EventType>(`/iapi/events/${id}/schedule`, token.substring(1), { date, time, timeZone }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    } else {
      setEvent({ ...event, date, time, timeZone } as EventType)
    }
  }).catch(error => console.error(`failed to put event schedule: ${error}`));

  const saveEventLocation = (url?: string, geo?: Geo) => put<EventType>(`/iapi/events/${id}/location`, token.substring(1), { url, geo }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    } else {
      setEvent({ ...event, url, geo } as EventType)
    }
  }).catch(error => console.error(`failed to put event location: ${error}`));

  const saveEventEaPnP1 = (emailAddressRequired: boolean, phoneNumberRequired: boolean, plus1Allowed: boolean) => patch<EventType>(`/iapi/events/${id}`, token.substring(1), { emailAddressRequired, phoneNumberRequired, plus1Allowed }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    } else {
      setEvent({ ...event, emailAddressRequired, phoneNumberRequired, plus1Allowed } as EventType)
    }
  }).catch(error => console.error(`failed to patch event: ${error}`));

  const saveEventVisibility = (visibility: Visibility) => put<EventType>(`/iapi/events/${id}/visibility`, token.substring(1), { visibility }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    } else {
      setEvent({ ...event, visibility } as EventType)
    }
  }).catch(error => console.error(`failed to put event visibility: ${error}`));


  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) => post<void>(`/iapi/events/${id}/reminders`, token.substring(1), { emailAddress, phoneNumber }).then(responseJson => {
    console.debug(responseJson.status);
    if (responseJson.status !== 204) {
      throw new Error(`HTTP status: ${responseJson.status} instead of 204`);
    }
  }).catch(error => console.error(`failed to post event reminders: ${error}`));

  if (token === "") {
    return (<p>Dude, where's my token?!</p>);
  }

  if (event === undefined && responseStatusCode === 200) {
    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>);
  } else if (responseStatusCode !== 200) {
    switch (responseStatusCode) {
      case 403:
        return (<p>Forbidden</p>);
      case 404:
        return (<p>Not Found</p>);
      case 410:
        return (<p>Gone</p>);
      default:
        return (<p>{responseStatusCode}</p>);
    }
  } else {
    return (
      <Switch>
        <Route exact path="/events/:event">
          {"host" === view ? (brandNew ? <Redirect to={`/events/${id}/links?brandNew=true${token}`} /> : <Redirect to={`/events/${id}/RSVPs${token}`} />) : <GuestEventComponent event={event as GuestEventType} timeZones={timeZones} />}
        </Route>
        <Route path="/events/:event/settings"><HostEventComponent activeTab={ACTIVE_TAB.SETTINGS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventLocation={saveEventLocation} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} sendLinksReminder={sendLinksReminder} timeZones={timeZones} /></Route>
        <Route path="/events/:event/RSVPs"><HostEventComponent activeTab={ACTIVE_TAB.RSVPS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventLocation={saveEventLocation} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} sendLinksReminder={sendLinksReminder} timeZones={timeZones} /></Route>
        <Route path="/events/:event/links"><HostEventComponent activeTab={ACTIVE_TAB.LINKS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventLocation={saveEventLocation} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} sendLinksReminder={sendLinksReminder} timeZones={timeZones} /></Route>
        {/* when none of the above match, <NotFound> will be rendered */}
        <Route ><NotFound /></Route>
      </Switch>
    );
  }
}

export default EventComponent;
