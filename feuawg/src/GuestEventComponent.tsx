import React from 'react';
import { GuestEventType } from './Events';
import MapDisplayClass from './MapDisplayClass';


interface GuestEventProps {
  event: GuestEventType;
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const { name, description } = props.event;
  return (
    <React.Fragment>
      <h1>{name}</h1>
      {description?.split('\n').map(line => <p>{line}</p>)}
      <MapDisplayClass value={props.event.geo}/>
    </React.Fragment>
  );
}

export default GuestEvent;
