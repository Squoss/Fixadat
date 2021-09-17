import React, { useContext } from 'react';
import { GuestEventType } from './Events';
import GuestEventRsvp from './GuestEventRsvp';
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

  const { id, guestToken, name, description, date, time, timeZone, geo } = props.event;
  const timeZones = props.timeZones.map((tz) => <li key={tz}><a className="dropdonw-item" href={`/events/${id}?timeZone=${tz}#${guestToken}`}>{tz}</a></li>);

  return (
    <React.Fragment>
      <h1>{name}</h1>
      <div className="d-grid gap-4">
        <div className="card" >
          <div className="card-body">
            <h5 className="card-title">{localizations['settings.what']}</h5>
            {description ? description.split('\n').map(line => <p className="card-Text">{line}</p>) : localizations['settings.seeInvitation']}  </div>
        </div>
        <div className="card" >
          <div className="card-body">
            <h5 className="card-title">{localizations['settings.when']}</h5>
            <p className="card-Text">{prettyLocalDateTimeString(localizations, date, time, timeZone)}</p>
          </div>
          {timeZone ?
            <div className="card-footer">
              <div className="dropdown">
                <button className="btn btn-sm btn-link dropdown-toggle" type="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">{localizations['convertToDifferentTimeZone']}</button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                  {timeZones}
                </ul>
              </div>
            </div>
            :
            ""
          }
        </div>
        <div className="card" >
          <div className="card-body">
            <h5 className="card-title">{localizations['settings.where']}</h5>
            {geo ? <MapDisplayClass value={props.event.geo} /> : <p className="card-text">{localizations['settings.seeInvitation']}</p>}
          </div>
        </div>
      </div>
      <h2>Anmeldung / Abmeldung</h2>
      <GuestEventRsvp event={props.event} />
    </React.Fragment>
  );
}

export default GuestEvent;
