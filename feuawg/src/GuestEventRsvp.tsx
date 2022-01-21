/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { useContext, useState } from "react";
import { Attendance, GuestEventType } from "./Events";
import { l10nContext } from "./l10nContext";

interface GuestEventRsvpProps {
  event: GuestEventType;
  saveRsvp: (
    name: string,
    attendance: Attendance,
    emailAddress?: string,
    phoneNumber?: string
  ) => void;
}

function GuestEventRsvp(props: GuestEventRsvpProps) {
  console.log("GuestEvent props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { emailAddressRequired, phoneNumberRequired, plus1Allowed } =
    props.event;

  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attendance, setAttendance] = useState<Attendance>(Attendance.NOT);

  const updateAttendance = (event: React.ChangeEvent<HTMLInputElement>) =>
    Object.entries(Attendance).forEach((a) => {
      if (a[1] === event.target.value) {
        setAttendance(a[1]);
      }
    });

  const emailAddressDiv = emailAddressRequired ? (
    <div className="row">
      <label htmlFor="emailAddress" className="form-label">
        E-mail address
      </label>
      <input
        type="email"
        className="form-control"
        id="emailAddress"
        placeholder="Ihre E-Mail-Adresse"
        value={emailAddress}
        onChange={(event) => setEmailAddress(event.target.value)}
      />
    </div>
  ) : (
    <div />
  );

  const phoneNumberDiv = phoneNumberRequired ? (
    <div className="row">
      <label htmlFor="phoneNumber" className="form-label">
        Phone number
      </label>
      <input
        type="tel"
        className="form-control"
        id="phoneNumber"
        placeholder="Ihre Telefonnummer"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
      />
    </div>
  ) : (
    <div />
  );

  const saveRsvp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.saveRsvp(
      name,
      attendance,
      emailAddress === "" ? undefined : emailAddress,
      phoneNumber === "" ? undefined : phoneNumber
    );
  };

  return (
    <form>
      <div className="row">
        <div className="col">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              value={Attendance.NOT}
              id="notAttending"
              checked={attendance === Attendance.NOT}
              onChange={updateAttendance}
            />
            <label className="form-check-label" htmlFor="notAttending">
              {localizations["rsvp.attendNot"]}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              value={Attendance.ALONE}
              id="attendingAlone"
              checked={attendance === Attendance.ALONE}
              onChange={updateAttendance}
            />
            <label className="form-check-label" htmlFor="attendingAlone">
              {localizations["rsvp.attendAlone"]}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              value={Attendance.WITHPLUS1}
              id="attendingPlus1"
              checked={attendance === Attendance.WITHPLUS1}
              onChange={updateAttendance}
              disabled={!plus1Allowed}
            />
            <label className="form-check-label" htmlFor="attendingPlus1">
              {localizations["rsvp.attendWithPlus1"]}
            </label>
          </div>
        </div>
        <div className="col">
          <div className="row">
            <label htmlFor="name" className="form-label">
              {localizations["rsvp.name"]}
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder={localizations["rsvp.yourName"]}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {emailAddressDiv}
          {phoneNumberDiv}
        </div>
        <div className="col">
          <button
            className={`btn ${
              attendance !== Attendance.NOT ? "btn-success" : "btn-danger"
            }`}
            onClick={saveRsvp}
            disabled={
              name === "" ||
              (attendance !== Attendance.NOT &&
                emailAddressRequired &&
                emailAddress === "") ||
              (attendance !== Attendance.NOT &&
                phoneNumberRequired &&
                phoneNumber === "")
            }
          >
            {attendance === Attendance.NOT
              ? localizations["rsvp.decline"]
              : localizations["rsvp.accept"]}
          </button>
        </div>
      </div>
    </form>
  );
}

export default GuestEventRsvp;
