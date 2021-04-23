import React from 'react';
import { GuestEventt } from './Events';


interface GuestEventProps {
  event: GuestEventt;
}

function GuestEvent(props: GuestEventProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const { name, description } = props.event;
  return (
    <React.Fragment>
      <h1>{name}</h1>
      <p>{description !== undefined ? description : ""}</p>
      <mark>To Do</mark>
    </React.Fragment>
  );
}

export default GuestEvent;
