import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { GuestEventType } from './Events';
import { l10nContext, Localizations } from './l10nContext';
import MapDisplayClass from './MapDisplayClass';


interface GuestEventProps {
  event: GuestEventType;
  timeZones: Array<string>;
}

function prettyLocalDateTimeString(localizations: Localizations, date?: string, time?: string, timeZone?: string) {

  if (date && time) {
    return new Date(`${date}T${time}`).toLocaleString(localizations['locale']) + (timeZone ? ` (${timeZone})` : "");
  } else if (date) {
    return new Date(date).toLocaleDateString(localizations['locale']);
  } else if (time) {
    return new Date(`${new Date().toISOString().substring(0, 10)}T${time}`).toLocaleTimeString(localizations['locale']);
  } else {
    return localizations['settings.seeInvitation'];
  }
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);
  const location = useLocation();

  const { id, name, description, date, time, timeZone, geo } = props.event;
  const timeZones = props.timeZones.map((tz) => <li key={tz}><a className="dropdonw-item" href={`/events/${id}?timeZone=${tz}${location.hash}`}>{tz}</a></li>);

  return (
    <React.Fragment>
      <h1>{name}</h1>
      <h2>{localizations['settings.what']}</h2>
      {description ? description.split('\n').map(line => <p>{line}</p>) : localizations['settings.seeInvitation']}
      <h2>{localizations['settings.when']}</h2>
      {prettyLocalDateTimeString(localizations, date, time, timeZone)}
      {timeZone ? <div className="dropdown">
        <a className="dropdown-toggle" href="#" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">{localizations['convertToDifferentTimeZone']}</a>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {timeZones}
        </ul>
      </div>
        : ""}
      <h2>{localizations['settings.where']}</h2>
      {geo ? <MapDisplayClass value={props.event.geo} /> : localizations['settings.seeInvitation']}
    </React.Fragment>
  );
}

export default GuestEvent;
