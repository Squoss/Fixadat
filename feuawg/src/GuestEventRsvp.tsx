import React, { useContext, useState } from 'react';
import { GuestEventType } from './Events';
import { l10nContext } from './l10nContext';


interface GuestEventRsvpProps {
  event: GuestEventType;
}

function GuestEventRsvp(props: GuestEventRsvpProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, guestToken, emailAddressRequired, phoneNumberRequired, plus1Allowed } = props.event;

  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attendance, setAttendance] = useState(0);

  const updateAttendance = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.value) {
      case "na":
        setAttendance(0); break;
      case "aa":
        setAttendance(1); break;
      case "a+1":
        if (plus1Allowed) {
          setAttendance(2);
        }
        break;
      default:
        console.error(`missing case for ${event.target.value}`);
    }
  }

  const emailAddressDiv = emailAddressRequired ? <div className="row">
    <label htmlFor="emailAddress" className="form-label">E-mail address</label>
    <input type="email" className="form-control" id="emailAddress" placeholder="Ihre E-Mail-Adresse" value={emailAddress} onChange={event => setEmailAddress(event.target.value)} />
  </div> : <div />

  const phoneNumberDiv = phoneNumberRequired ? <div className="row">
    <label htmlFor="phoneNumber" className="form-label">Phone number</label>
    <input type="tel" className="form-control" id="phoneNumber" placeholder="Ihre Telefonnummer" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} />
  </div> : <div />

  return (
    <form>
      <div className="row">
        <div className="col">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value="na" id="notAttending" checked={attendance === 0} onChange={updateAttendance} />
            <label className="form-check-label" htmlFor="notAttending">
              I will NOT attend.
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value="aa" id="attendingAlone" checked={attendance === 1} onChange={updateAttendance} />
            <label className="form-check-label" htmlFor="attendingAlone">
              I will attend alone.
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value="a+1" id="attendingPlus1" checked={attendance === 2} onChange={updateAttendance} disabled={!plus1Allowed} />
            <label className="form-check-label" htmlFor="attendingPlus1">
              I will attend with a plus-one.
            </label>
          </div>
        </div>
        <div className="col">
          <div className="row">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" placeholder="Ihr Name" value={name} onChange={event => setName(event.target.value)} />
          </div>
          {emailAddressDiv}
          {phoneNumberDiv}
        </div>
        <div className="col">
          <button className={`btn ${attendance > 0 ? "btn-success" : "btn-danger"}`} onClick={e => e.preventDefault()} disabled={name === "" || (attendance > 0 && emailAddressRequired && emailAddress === "") || (attendance > 0 && phoneNumberRequired && phoneNumber === "")}>{attendance === 0 ? "Abmelden" : "Anmelden"}</button>
        </div>
      </div>
    </form>
  );
}

export default GuestEventRsvp;
