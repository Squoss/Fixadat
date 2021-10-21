import React, { useContext, useState } from 'react';
import { Attendance, GuestEventType } from './Events';
import { l10nContext } from './l10nContext';


interface GuestEventRsvpProps {
  event: GuestEventType;
  saveRsvp: (name: string, attendance: Attendance, emailAddress?: string, phoneNumber?: string) => void;
}

function GuestEventRsvp(props: GuestEventRsvpProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { emailAddressRequired, phoneNumberRequired, plus1Allowed } = props.event;

  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attendance, setAttendance] = useState<Attendance>(Attendance.NOT);

  const updateAttendance = (event: React.ChangeEvent<HTMLInputElement>) => Object.entries(Attendance).forEach(a => { if (a[1] === event.target.value) { setAttendance(a[1]) } })

  const emailAddressDiv = emailAddressRequired ? <div className="row">
    <label htmlFor="emailAddress" className="form-label">E-mail address</label>
    <input type="email" className="form-control" id="emailAddress" placeholder="Ihre E-Mail-Adresse" value={emailAddress} onChange={event => setEmailAddress(event.target.value)} />
  </div> : <div />

  const phoneNumberDiv = phoneNumberRequired ? <div className="row">
    <label htmlFor="phoneNumber" className="form-label">Phone number</label>
    <input type="tel" className="form-control" id="phoneNumber" placeholder="Ihre Telefonnummer" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} />
  </div> : <div />

  const saveRsvp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.saveRsvp(name, attendance, emailAddress === "" ? undefined : emailAddress, phoneNumber === "" ? undefined : phoneNumber);
  }

  return (
    <form>
      <div className="row">
        <div className="col">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value={Attendance.NOT} id="notAttending" checked={attendance === Attendance.NOT} onChange={updateAttendance} />
            <label className="form-check-label" htmlFor="notAttending">
              I will NOT attend.
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value={Attendance.ALONE} id="attendingAlone" checked={attendance === Attendance.ALONE} onChange={updateAttendance} />
            <label className="form-check-label" htmlFor="attendingAlone">
              I will attend alone.
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="flexRadioDefault" value={Attendance.WITHPLUS1} id="attendingPlus1" checked={attendance === Attendance.WITHPLUS1} onChange={updateAttendance} disabled={!plus1Allowed} />
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
          <button className={`btn ${attendance !== Attendance.NOT ? "btn-success" : "btn-danger"}`} onClick={saveRsvp} disabled={name === "" || (attendance !== Attendance.NOT && emailAddressRequired && emailAddress === "") || (attendance !== Attendance.NOT && phoneNumberRequired && phoneNumber === "")}>{attendance === Attendance.NOT ? "Abmelden" : "Anmelden"}</button>
        </div>
      </div>
    </form>
  );
}

export default GuestEventRsvp;
