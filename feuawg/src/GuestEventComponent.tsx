import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { GuestEventType } from './Events';
import { l10nContext } from './l10nContext';
import MapDisplayClass from './MapDisplayClass';


interface GuestEventProps {
  event: GuestEventType;
  timeZones: Array<string>;
}

function prettyLocalDateTimeString(localization: string, date?: string, time?: string, timeZone?: string) {

  if (date && time) {
    return new Date(`${date}T${time}`).toLocaleString(localization) + (timeZone ? ` (${timeZone})` : "");
  } else if (date) {
    return new Date(date).toLocaleDateString(localization);
  } else if (time) {
    return new Date(`${new Date().toISOString().substring(0, 10)}T${time}`).toLocaleTimeString(localization);
  } else {
    return "siehe Einladung";
  }
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);
  const location = useLocation();

  const { id, name, description, date, time, timeZone } = props.event;
  const timeZones = props.timeZones.map((tz) => <li key={tz}><a className="dropdonw-item" href={`/events/${id}?timeZone=${tz}${location.hash}`}>{tz}</a></li>);

  return (
    <React.Fragment>
      <h1>{name}</h1>
      {description?.split('\n').map(line => <p>{line}</p>)}
      <h2>Schedule</h2>
      {prettyLocalDateTimeString(localizations['locale'], date, time, timeZone)}
      {timeZone ? <div className="dropdown">
        <a className="dropdown-toggle" href="#" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">Convert to different time zone</a>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {timeZones}
        </ul>
      </div>
        : ""}
      <h2>Location</h2>
      <MapDisplayClass value={props.event.geo} />
    </React.Fragment>
  );
}

export default GuestEvent;
