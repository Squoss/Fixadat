import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HostEventt } from './Events';
import HostEventLinks from './HostEventLinks';
import HostEventRsvps from './HostEventRsvps';
import { l10nContext } from './l10nContext';


export enum ACTIVE_TAB {
  LINKS = "links",
  RSVPS = "RSVPs"
}

interface HostEventProps {
  event: HostEventt;
  activeTab: ACTIVE_TAB;
}

function HostEvent(props: HostEventProps) {
  console.log("HostEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, guestToken, hostToken, name, description, emailAddressRequired, phoneNumberRequired, plus1Allowed, visibility } = props.event;

  const location = useLocation();
  const brandNew = new URLSearchParams(location.search).has("brandNew");

  let content;
  switch (props.activeTab) {
    case ACTIVE_TAB.LINKS:
      content = <HostEventLinks id={id} hostToken={hostToken} guestToken={guestToken} />;
      break;
    case ACTIVE_TAB.RSVPS:
      content = <HostEventRsvps />;
      break;
    default:
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustiveCheck: never = props.activeTab;
      return _exhaustiveCheck;
  }

  const brandNewAlert = <div className="alert alert-success" role="alert">{localizations['repliesPageCreated']}</div>

  return (
    <React.Fragment>
      <h1>{name}</h1>
      {brandNew ? brandNewAlert : <span></span>}
      <dl>
        <dt>Name</dt><dd>{name}</dd>
        <dt>Description</dt><dd>{description}</dd>
        <dt>E-mail address required</dt><dd>{emailAddressRequired}</dd>
        <dt>Phone number required</dt><dd>{phoneNumberRequired}</dd>
        <dt>+1 allowed</dt><dd>{plus1Allowed}</dd>
        <dt>Visibility</dt><dd>{visibility}</dd>
      </dl>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink className="nav-link" activeClassName="active" to={`/events/${id}/links#${hostToken}`}>Links</NavLink>
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
