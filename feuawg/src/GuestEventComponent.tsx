import React, { useContext } from 'react';
import { GuestEventType } from './Events';
import { l10nContext } from './l10nContext';
import MapDisplayClass from './MapDisplayClass';


interface GuestEventProps {
  event: GuestEventType;
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { name, description, date, time, timeZone } = props.event;

  return (
    <React.Fragment>
      <h1>{name}</h1>
      {description?.split('\n').map(line => <p>{line}</p>)}
      <h2>Schedule</h2>
      <h3>Date</h3>
      {date ? <input type="date" value={date} readOnly={true} /> : "siehe Einladung"}
      <h3>Time</h3>
      {time ? <input type="time" value={time} readOnly={true} /> : "siehe Einladung"}
      <h3>Time Zone</h3>
      {timeZone ? timeZone : "siehe Einladung"}
      <h2>Location</h2>
      <MapDisplayClass value={props.event.geo} />
    </React.Fragment>
  );
}

export default GuestEvent;
