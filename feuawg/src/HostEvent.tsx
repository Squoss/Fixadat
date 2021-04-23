import React from 'react';
import { NavLink } from 'react-router-dom';
import { HostEventt } from './Events';
import HostEventLinks from './HostEventLinks';
import HostEventMeta from './HostEventMeta';
import HostEventRsvps from './HostEventRsvps';


export enum ACTIVE_TAB {
  LINKS = "links",
  META = "meta",
  RSVPS = "RSVPs"
}

interface HostEventProps {
  event: HostEventt;
  activeTab: ACTIVE_TAB;
}

function HostEvent(props: HostEventProps) {
  console.log("HostEvent props: " + JSON.stringify(props));

  const { id, guestToken, hostToken, name } = props.event;

  let content;
  switch (props.activeTab) {
    case ACTIVE_TAB.LINKS:
      content = <HostEventLinks id={id} hostToken={hostToken} guestToken={guestToken} />;
      break;
    case ACTIVE_TAB.META:
      content = <HostEventMeta />;
      break;
    case ACTIVE_TAB.RSVPS:
      content = <HostEventRsvps />;
      break;
    default:
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustiveCheck: never = props.activeTab;
      return _exhaustiveCheck;
  }

  return (
    <React.Fragment>
      <h1>HostEvent {name} with {hostToken}</h1>
      <mark>To Do</mark>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink className="nav-link" activeClassName="active" to={`/events/${id}/links#${hostToken}`}>Links</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" activeClassName="active" to={`/events/${id}/meta#${hostToken}`}>Meta</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" activeClassName="active" to={`/events/${id}/RSVPs#${hostToken}`}>RSVPs</NavLink>
        </li>
      </ul>
      {content}
    </React.Fragment>
  );
}

export default HostEvent;
