import { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { EventType, GuestEventType, HostEventType, Visibility } from './Events';
import { get, patch, put } from './fetchJson';
import GuestEventComponent from './GuestEventComponent';
import HostEventComponent, { ACTIVE_TAB } from './HostEventComponent';
import NotFound from './NotFound';


function EventComponent(props: {}) {
  console.log("Event props: " + JSON.stringify(props));

  const location = useLocation();
  const id = useRouteMatch<{id: string}>({path:"/events/:id"})!.params.id;
  console.debug(id);
  const token = location.hash;
  console.debug(token);
  const brandNew = new URLSearchParams(location.search).has("brandNew");
  const view = useRouteMatch<{id: string; hostish:string}>({path:"/events/:id/:hostish"})?.params.hostish ? "host" : (new URLSearchParams(location.search)).get("view");
  console.debug(view);

  const [event, setEvent] = useState<EventType | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);

  useEffect(() => {
    const getEvent = async () => {
      try {
        const responseJson = await get<EventType>(`/iapi/events/${id}${view !== null ? "?view="+view:""}`, token.substring(1)).then();
        console.debug(responseJson.status);
        console.debug(responseJson.parsedBody);
        setResponseStatusCode(responseJson.status);
        if (responseJson.status === 200 ) {
          setEvent(responseJson.parsedBody);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (token !== "") {
      getEvent();
    }
  }, [id, token, view]);

  const saveEventText = async (name: string, description?: string) => {
    try {
      const body = {name, description};
      const responseJson = await put<EventType>(`/iapi/events/${id}/text`, token.substring(1),body).then();
      console.debug(responseJson.status);
      if (responseJson.status !== 204) {
        alert(responseJson.status);
      } else {
        setEvent({ ...event, name, description } as EventType)
      }
    } catch (error) {
      console.error(error);
    }
  }

  
  const saveEventSchedule = async (date?: string, time?: string, timeZone?: string) => {
    try {
      const body = { date, time, timeZone };
      const responseJson = await put<EventType>(`/iapi/events/${id}/schedule`, token.substring(1), body).then();
      console.debug(responseJson.status);
      if (responseJson.status !== 204) {
        alert(responseJson.status);
      } else {
        setEvent({ ...event, date, time, timeZone } as EventType)
      }
    } catch (error) {
      console.error(error);
    }
  }

  const saveEventEaPnP1 = async (emailAddressRequired: boolean, phoneNumberRequired: boolean, plus1Allowed: boolean) => {
    try {
      const body = { emailAddressRequired, phoneNumberRequired, plus1Allowed };
      const responseJson = await patch<EventType>(`/iapi/events/${id}`, token.substring(1), body).then();
      console.debug(responseJson.status);
      if (responseJson.status !== 204) {
        alert(responseJson.status);
      } else {
        setEvent({ ...event, emailAddressRequired, phoneNumberRequired, plus1Allowed } as EventType)
      }
    } catch (error) {
      console.error(error);
    }
  }

  const saveEventVisibility = async (visibility: Visibility) => {
    try {
      const body = { visibility };
      const responseJson = await put<EventType>(`/iapi/events/${id}/visibility`, token.substring(1), body).then();
      console.debug(responseJson.status);
      if (responseJson.status !== 204) {
        alert(responseJson.status);
      } else {
        setEvent({ ...event, visibility } as EventType)
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (token === "") {
    return (<p>Dude, where's my token?!</p>);
  }

  if (event === undefined && responseStatusCode === 200) {
    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>);
  } else if (responseStatusCode!== 200 ){
    switch(responseStatusCode){
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
          {"host" === view ? ( brandNew?<Redirect to={`/events/${id}/links?brandNew=true${token}`} />:<Redirect to={`/events/${id}/RSVPs${token}`} /> ): <GuestEventComponent event={event as GuestEventType} />}
        </Route>
        <Route path="/events/:event/settings"><HostEventComponent activeTab={ACTIVE_TAB.SETTINGS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} /></Route>
        <Route path="/events/:event/RSVPs"><HostEventComponent activeTab={ACTIVE_TAB.RSVPS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} /></Route>
        <Route path="/events/:event/links"><HostEventComponent activeTab={ACTIVE_TAB.LINKS} event={event as HostEventType} saveEventText={saveEventText} saveEventSchedule={saveEventSchedule} saveEventEaPnP1={saveEventEaPnP1} saveEventVisibility={saveEventVisibility} /></Route>
        {/* when none of the above match, <NotFound> will be rendered */}
        <Route ><NotFound /></Route>
      </Switch>
    );
  }
}

export default EventComponent;
