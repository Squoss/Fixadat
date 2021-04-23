import React from "react";

import Clipboard from './Clipboard';

interface HostEventLinksProps {
  id: number;
  hostToken: string;
  guestToken: string;
}

function HostEventLinks(props: HostEventLinksProps) {
  console.log("HostEventLinks props: " + JSON.stringify(props));

  const { id, hostToken, guestToken } = props;

  const guestLink = `${window.origin}/events/${id}#${guestToken}`;
  const hostLink = `${window.origin}/events/${id}?view=host#${hostToken}`

  return (
    <React.Fragment>
      <div className="card text-dark bg-warning mb-3" >
        <div className="card-header">For your guests <i className="bi bi-people"></i></div>
        <div className="card-body">
          <h5 className="card-title"><mark>{guestLink}</mark> <Clipboard text={guestLink} /></h5>
          <p className="card-text">Copy and share this link with your guests</p>
        </div>
      </div>
      <div className="card text-white bg-danger mb-3">
        <div className="card-header">Only for you <i className="bi bi-person-badge"></i></div>
        <div className="card-body">
          <h5 className="card-title"><mark>{hostLink}</mark> <Clipboard text={hostLink} /></h5>
          <p className="card-text"><i className="bi bi-bookmark"></i> ?! Only for you (and other hosts)</p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default HostEventLinks;
