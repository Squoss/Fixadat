import React, { useState } from "react";
import { Geo, HostEventType, Visibility } from "./Events";
import MapSearchClass from "./MapSearchClass";

interface HostEventSettingsProps {
  event: HostEventType;
  saveEventText: (name: string, description?: string) => void;
  timeZones: Array<string>;
  saveEventSchedule: (date?: string, time?: string, timeZone?: string) => void;
  saveEventEaPnP1: (emailAddressRequired: boolean, phoneNumberRequired: boolean, plus1Allowed: boolean) => void;
  saveEventVisibility: (visibility: Visibility) => void;
  saveEventLocation: (url?: string, location?: Geo) => void;
}

function tte(s?: string) { // trim to empty
  return s === undefined ? "" : s.trim();
}

function ttu(s?: string) { // trim to undefined
  return s === undefined || s.trim() === "" ? undefined : s.trim();
}

function HostEventSettings(props: HostEventSettingsProps) {
  console.log("HostEventSettings props: " + JSON.stringify(props));

  const [editText, setEditText] = useState(false);
  const [name, setName] = useState(props.event.name);
  const [description, setDescription] = useState(tte(props.event.description));

  const [editSchedule, setEditSchedule] = useState(false);
  const [date, setDate] = useState(tte(props.event.date));
  const [time, setTime] = useState(tte(props.event.time));
  const [timeZone, setTimeZone] = useState(tte(props.event.timeZone));
  const timeZones = props.timeZones.map((tz) => <option key={tz} value={tz}>{tz}</option>);

  const [editLocation, setEditLocation] = useState(false);
  const [url, setUrl] = useState(props.event.url);
  const [geo, setGeo] = useState(props.event.geo);

  const [editEaPnP1, setEditEaPnP1] = useState(false);
  const [emailAddressRequired, setEmailAddressRequired] = useState(props.event.emailAddressRequired);
  const [phoneNumberRequired, setPhoneNumberRequired] = useState(props.event.phoneNumberRequired);
  const [plus1Allowed, setPlus1Allowed] = useState(props.event.plus1Allowed);

  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(props.event.visibility);

  const cancelText = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditText(false);
    setName(props.event.name);
    setDescription(tte(props.event.description));
  }

  const saveText = () => {
    setEditText(false);
    props.saveEventText(name.trim(), ttu(description));
  }

  const cancelSchedule = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditSchedule(false);
    setDate(tte(props.event.date));
    setTime(tte(props.event.time));
    setTimeZone(tte(props.event.timeZone));
  }

  const saveSchedule = () => {
    setEditSchedule(false);
    props.saveEventSchedule(ttu(date), ttu(time), ttu(timeZone));
  }

  const cancelLocation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditLocation(false);
    setUrl(props.event.url);
    setGeo(props.event.geo);
  }

  const saveLocation = () => {
    setEditLocation(false);
    props.saveEventLocation(url, geo);
  }

  const cancelEaPnP1 = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditEaPnP1(false);
    setEmailAddressRequired(props.event.emailAddressRequired);
    setPhoneNumberRequired(props.event.phoneNumberRequired);
    setPlus1Allowed(props.event.plus1Allowed);
  }

  const saveEaPnP1 = () => {
    setEditEaPnP1(false);
    props.saveEventEaPnP1(emailAddressRequired, phoneNumberRequired, plus1Allowed);
  }

  const cancelVisibility = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditVisibility(false);
    setVisibility(props.event.visibility);
  }

  const saveVisibility = () => {
    setEditVisibility(false);
    props.saveEventVisibility(visibility);
  }

  return (
    <form className="d-grid gap-4">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Text</h5>
          <div>
            <label htmlFor="nameText" className="form-label">Name</label>
            <input type="text" className="form-control" id="nameText" placeholder="Event Name" value={name} onChange={event => setName(event.target.value)} readOnly={!editText} />
          </div>
          <div>
            <label htmlFor="descriptionText" className="form-label">Description</label>
            <textarea className="form-control" id="descriptionText" rows={3} value={description} onChange={event => setDescription(event.target.value)} readOnly={!editText} />
          </div>
        </div>
        <div className="card-footer">
          {editText ?
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelText}>Cancel</button>
              <button className="btn btn-primary" onClick={saveText} disabled={name === "" || props.event.name === name && tte(props.event.description) === description}>Save</button>
            </div>
            :
            <button className="btn btn-light" onClick={(e) => { e.preventDefault(); setEditText(true); }}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Schedule</h5>
          <div>
            <label htmlFor="dateSchedule" className="form-label">Date</label>
            <input type="date" className="form-control" id="dateSchedule" value={date} onChange={event => setDate(event.target.value)} readOnly={!editSchedule} />
          </div>
          <div>
            <label htmlFor="timeSchedule" className="form-label">Time</label>
            <input type="time" className="form-control" id="timeSchedule" value={time} onChange={event => setTime(event.target.value)} readOnly={!editSchedule} />
          </div>
        </div>
        <div className="input-group">
          <span className="input-group-text">Time Zone</span>
          <select className="form-select" id="timeZoneSelect" required={false} value={timeZone} onChange={event => setTimeZone(event.target.value)} disabled={!editSchedule}>
            <option key="noTimeZone" value={undefined}></option>
            {timeZones}
          </select>
        </div>
        <div className="card-footer">
          {editSchedule ?
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelSchedule}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSchedule} disabled={tte(props.event.date) === date && tte(props.event.time) === time && tte(props.event.timeZone) === timeZone}>Save</button>
            </div>
            :
            <button className="btn btn-light" onClick={(e) => { e.preventDefault(); setEditSchedule(true); }}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Location</h5>
          <div>
            <label htmlFor="mapSearchClass" className="form-label">Geo</label>
            <MapSearchClass disabled={!editLocation} value={geo} setValue={setGeo} />
          </div>
        </div>
        <div className="card-footer">
          {editLocation ?
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelLocation}>Cancel</button>
              <button className="btn btn-primary" onClick={saveLocation} disabled={props.event.url === url && props.event.geo?.name === geo?.name && props.event.geo?.longitude
                === geo?.longitude && props.event.geo?.latitude === geo?.latitude}>Save</button>
            </div>
            :
            <button className="btn btn-light" onClick={(e) => { e.preventDefault(); setEditLocation(true); }}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Additional Information</h5>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="emailAddressRequiredCheckbox" checked={emailAddressRequired} onChange={event => setEmailAddressRequired(event.target.checked)} disabled={!editEaPnP1} />
            <label className="form-check-label" htmlFor="emailAddressRequiredCheckbox">E-mail address required</label>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="phoneNumberRequiredCheckbox" checked={phoneNumberRequired} onChange={event => setPhoneNumberRequired(event.target.checked)} disabled={!editEaPnP1} />
            <label className="form-check-label" htmlFor="phoneNumberRequiredCheckbox">Phone number required</label>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="plus1AllowedCheckbox" checked={plus1Allowed} onChange={event => setPlus1Allowed(event.target.checked)} disabled={!editEaPnP1} />
            <label className="form-check-label" htmlFor="plus1AllowedCheckbox">+1 allowed</label>
          </div>
        </div>
        <div className="card-footer">
          {editEaPnP1 ?
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelEaPnP1}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEaPnP1} disabled={props.event.emailAddressRequired === emailAddressRequired && props.event.phoneNumberRequired === phoneNumberRequired && props.event.plus1Allowed === plus1Allowed}>Save</button>
            </div>
            :
            <button className="btn btn-light" onClick={(e) => { e.preventDefault(); setEditEaPnP1(true); }}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Visibility</h5>
          <select className="form-select" id="visibilitySelect" value={visibility} onChange={event => Object.entries(Visibility).forEach(v => { if (v[1] === event.target.value) { setVisibility(v[1]) } })} disabled={!editVisibility}>
            <option value={Visibility.PUBLIC}>Read/Write</option>
            <option value={Visibility.PROTECTED}>Read-only</option>
            <option value={Visibility.PRIVATE}>???</option>
          </select>
        </div>
        <div className="card-footer">
          {editVisibility ?
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelVisibility}>Cancel</button>
              <button className="btn btn-primary" onClick={saveVisibility} disabled={props.event.visibility === visibility}>Save</button>
            </div>
            :
            <button className="btn btn-light" onClick={(e) => { e.preventDefault(); setEditVisibility(true); }}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
    </form >
  );
}

export default HostEventSettings;