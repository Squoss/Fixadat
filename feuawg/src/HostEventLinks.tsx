import React, { useContext } from "react";
import Clipboard from './Clipboard';
import { l10nContext } from "./l10nContext";


interface HostEventLinksProps {
  id: number;
  hostToken: string;
  guestToken: string;
}

function HostEventLinks(props: HostEventLinksProps) {
  console.log("HostEventLinks props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, hostToken, guestToken } = props;

  const guestLink = `${window.origin}/events/${id}#${guestToken}`;
  const hostLink = `${window.origin}/events/${id}?view=host#${hostToken}`

  return (
    <React.Fragment>
      <div className="card text-dark bg-warning mb-3" >
        <div className="card-header">{localizations['links.guests']}</div>
        <div className="card-body">
          <h5 className="card-title"><mark>{guestLink}</mark> <Clipboard text={guestLink} /></h5>
          <p className="card-text">{localizations['links.meta']}</p>
        </div>
      </div>
      <div className="card text-white bg-danger mb-3">
        <div className="card-header">{localizations['links.hosts']}</div>
        <div className="card-body">
          <h5 className="card-title"><mark>{hostLink}</mark> <Clipboard text={hostLink} /></h5>
          <p className="card-text"><i className="bi bi-shield-fill-exclamation"></i> {localizations['links.kiss']}</p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default HostEventLinks;
