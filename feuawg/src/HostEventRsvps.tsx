import React from "react";
import { HostEventType } from "./Events";

interface HostEventRsvpsProps {
  event: HostEventType;
}

function HostEventRsvps(props: HostEventRsvpsProps) {
  console.log("HostEventRsvps props: " + JSON.stringify(props));

  return (
    <React.Fragment>
      <mark>To Do HostEventRsvps</mark>
      <h1>{props.event.rsvps.length}</h1>
    </React.Fragment>
  );
}

export default HostEventRsvps;
