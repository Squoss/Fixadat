import { Modal } from "bootstrap";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { post } from "./fetchJson";

interface PostEventResponse {
  id: number;
  hostToken: string;
}

function Abode(props: {}) {
  console.log("Abode props: " + JSON.stringify(props));

  const [redirect, setRedirect] = useState<undefined | string>(undefined);

  const postEvent = async () => {
    try {
      const responseJson = await post<PostEventResponse>("/iapi/events", {}).then();
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      setRedirect(`/events/${responseJson.parsedBody?.id}?view=host#${responseJson.parsedBody?.hostToken}`);
    } catch (error) {
      console.error(error);
    }
  };


  const handlePostEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    Modal.getInstance(document.getElementById('postEventModal')!).hide();
    postEvent();
  };

  if (redirect !== undefined) { return (<Redirect to={redirect} />) } else {
    return (
      <React.Fragment>
        <div className="bg-light p-5 rounded">
          <h1>répondez s'il vous plaît</h1>
          <p className="lead">Use your favorite off-line &amp; on-line channels for invitations and let invitees conveniently RSVP in one place.</p>
          <button type="button" className="btn btn-lg btn-primary" data-bs-toggle="modal" data-bs-target="#postEventModal">
            Create a basic page for RSVPing &raquo;
      </button>
          <p>It's free of charge and requires no signing up.</p>
        </div>

        <div className="modal fade" id="postEventModal" tabIndex={-1} aria-labelledby="postEventModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="postEventModalLabel">First things first</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                I have read, understand and accept the Privacy Policy as well as the Terms of Service.
            </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No</button>
                <form onSubmit={handlePostEvent}>
                  <button type="submit" className="btn btn-primary">Yes</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Abode;
