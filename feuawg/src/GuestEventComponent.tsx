import React from 'react';
import { GuestEventType } from './Events';


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
      <mark>To Do</mark>
    </React.Fragment>
  );
}

export default GuestEvent;
