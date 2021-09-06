import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import Clipboard from './Clipboard';
import { l10nContext } from "./l10nContext";


interface HostEventLinksProps {
  id: number;
  hostToken: string;
  guestToken: string;
  sendLinksReminder: (emailAddress?: string, phoneNumber?: string) => void;
}

function HostEventLinks(props: HostEventLinksProps) {
  console.log("HostEventLinks props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, guestToken, hostToken } = props;

  const guestLink = `${window.origin}/events/${id}#${guestToken}`;
  const hostLink = `${window.origin}/events/${id}?view=host#${hostToken}`

  const [emailAddress, setEmailAddress] = useState("");
  const [cellPhoneNumber, setCellPhoneNumber] = useState("");

  const sendLinksReminderEmail = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.sendLinksReminder(emailAddress, undefined)
  }

  const sendLinksReminderSms = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.sendLinksReminder(undefined, cellPhoneNumber)
  }

  return (
    <React.Fragment>
      <div className="card text-dark bg-warning mb-3" >
        <div className="card-header">{localizations['links.guests']}</div>
        <div className="card-body">
          <h5 className="card-title"><mark>{guestLink}</mark> <Clipboard text={guestLink} /></h5>
          <p className="card-text"><NavLink className="link-dark" to={`/events/${id}/settings#${hostToken}`}>{localizations['links.meta']}</NavLink></p>
        </div>
      </div>
      <div className="card text-white bg-danger mb-3">
        <div className="card-header"><i className="bi bi-shield-fill-exclamation"></i> {localizations['links.hosts']}</div>
        <div className="card-body">
          <h5 className="card-title"><mark>{hostLink}</mark> <Clipboard text={hostLink} /></h5>
          <div className="row">
            <p className="card-text col"><i className="bi bi-life-preserver"></i> {localizations['links.reminderTo']}</p>
            <form className="col">
              <div className="row">
                <div className="col-auto">
                  <input id="emailAddress" type="email" className="form-control" placeholder="yours.truly@squawg.com" aria-label="e-mail address" value={emailAddress} onChange={event => setEmailAddress(event.target.value)} required />
                </div>
                <div className="col-auto">
                  <button className="btn btn-light" onClick={sendLinksReminderEmail} disabled={emailAddress === ""}>{localizations['links.byEmail']}</button>
                </div>
              </div>
            </form>
            <form className="col">
              <div className="row">
                <div className="col-auto">
                  <input id="cellPhoneNumber" type="tel" className="form-control" placeholder="078 965 43 21" aria-label="cell-phone number" value={cellPhoneNumber} onChange={event => setCellPhoneNumber(event.target.value)} required />
                </div>
                <div className="col-auto">
                  <button className="btn btn-light" onClick={sendLinksReminderSms} disabled={cellPhoneNumber === ""}>{localizations['links.bySms']}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default HostEventLinks;
