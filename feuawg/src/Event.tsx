import { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { Eventt, GuestEventt, HostEventt } from './Events';
import { get } from './fetchJson';
import GuestEvent from './GuestEvent';
import HostEvent, { ACTIVE_TAB } from './HostEvent';
import NotFound from './NotFound';


function Event(props: {}) {
  console.log("Event props: " + JSON.stringify(props));

  const location = useLocation();
  const id = useRouteMatch<{id: string}>({path:"/events/:id"})!.params.id;
  console.debug(id);
  const token = location.hash;
  console.debug(token);
  const brandNew = new URLSearchParams(location.search).has("brandNew");
  const view = useRouteMatch<{id: string; hostish:string}>({path:"/events/:id/:hostish"})?.params.hostish ? "host" : (new URLSearchParams(location.search)).get("view");
  console.debug(view);

  const [event, setEvent] = useState<Eventt | undefined>(undefined);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);

  useEffect(() => {
    const getEvent = async () => {
      try {
        const responseJson = await get<Eventt>(`/iapi/events/${id}${view !== null ? "?view="+view:""}`, token.substring(1)).then();
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
    if(token!==""){getEvent();}
  }, [id, token, view]);


  if (token === "") {
    return (<p>Dude, where's my token?!</p>);
  }

  if (event === undefined && responseStatusCode===200) {
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
          {"host" === view ? ( brandNew?<Redirect to={`/events/${id}/links?brandNew=true${token}`} />:<Redirect to={`/events/${id}/RSVPs${token}`} /> ): <GuestEvent event={event as GuestEventt} />}
        </Route>
        <Route path="/events/:event/links"><HostEvent activeTab={ACTIVE_TAB.LINKS} event={event as HostEventt} /></Route>
        <Route path="/events/:event/RSVPs"><HostEvent activeTab={ACTIVE_TAB.RSVPS} event={event as HostEventt} /></Route>
        {/* when none of the above match, <NotFound> will be rendered */}
        <Route ><NotFound /></Route>
      </Switch>
    );
  }
}

export default Event;
