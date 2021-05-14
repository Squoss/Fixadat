import React, { useState } from "react";
import { HostEventt, Visibility } from "./Events";

interface HostEventSettingsProps {
  event: HostEventt;
  timeZones: Array<string>;
}

function HostEventSettings(props: HostEventSettingsProps) {
  console.log("HostEventSettings props: " + JSON.stringify(props));

  const [editText, setEditText] = useState(false);
  const [name, setName] = useState(props.event.name);
  const [description, setDescription] = useState(props.event.description);

  const [editSchedule, setEditSchedule] = useState(false);
  const [date, setDate] = useState(props.event.date);
  const [time, setTime] = useState(props.event.time);
  const [timeZone, setTimeZone] = useState<string>(props.event.timeZone === undefined ? "" : props.event.timeZone);
  const timeZones = props.timeZones.map((tz) => <option key={tz} value={tz}>{tz}</option>);

  const [editEaPnP1, setEditEaPnP1] = useState(false);
  const [emailAddressRequired, setEmailAddressRequired] = useState(props.event.emailAddressRequired);
  const [phoneNumberRequired, setPhoneNumberRequired] = useState(props.event.phoneNumberRequired);
  const [plus1Allowed, setPlus1Allowed] = useState(props.event.plus1Allowed);

  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(props.event.visibility);

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
            <React.Fragment>
              <button className="btn btn-secondary" onClick={() => setEditText(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setEditText(false)} disabled={name.trim() === "" || props.event.name === name && props.event.description === description}>Save</button>
            </React.Fragment>
            :
            <button className="btn btn-light" onClick={() => setEditText(true)}><i className="bi bi-pencil-square"></i></button>
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
            <React.Fragment>
              <button className="btn btn-secondary" onClick={() => setEditSchedule(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setEditSchedule(false)} disabled={props.event.date === date && props.event.time === time && (props.event.timeZone === timeZone || props.event.timeZone === undefined && timeZone === "")}>Save</button>
            </React.Fragment>
            :
            <button className="btn btn-light" onClick={() => setEditSchedule(true)}><i className="bi bi-pencil-square"></i></button>
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
            <React.Fragment>
              <button className="btn btn-secondary" onClick={() => setEditEaPnP1(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setEditEaPnP1(false)} disabled={props.event.emailAddressRequired === emailAddressRequired && props.event.phoneNumberRequired === phoneNumberRequired && props.event.plus1Allowed === plus1Allowed}>Save</button>
            </React.Fragment>
            :
            <button className="btn btn-light" onClick={() => setEditEaPnP1(true)}><i className="bi bi-pencil-square"></i></button>
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
            <React.Fragment>
              <button className="btn btn-secondary" onClick={() => setEditVisibility(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setEditVisibility(false)} disabled={props.event.visibility === visibility}>Save</button>
            </React.Fragment>
            :
            <button className="btn btn-light" onClick={() => setEditVisibility(true)}><i className="bi bi-pencil-square"></i></button>
          }
        </div>
      </div>
    </form>
  );
}

export default HostEventSettings;
