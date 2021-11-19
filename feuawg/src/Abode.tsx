import { Modal } from "bootstrap";
import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { post } from "./fetchJson";
import { l10nContext } from "./l10nContext";

interface PostEventResponse {
  id: number;
  hostToken: string;
}

function Abode(props: {}) {
  console.log("Abode props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const [redirect, setRedirect] = useState<string>("");

  const postEvent = () => post<PostEventResponse>("/iapi/events").then(responseJson => {
    console.debug(responseJson.status);
    console.debug(responseJson.parsedBody);
    setRedirect(`/events/${responseJson.parsedBody?.id}?brandNew=true&view=host#${responseJson.parsedBody?.hostToken}`);
  }).catch(error => console.error(`failed to post event: ${error}`));


  const handlePostEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    Modal.getInstance(document.getElementById('postEventModal')!)!.hide();
    postEvent();
  };

  if (redirect !== "") {
    return (<Redirect to={redirect} />)
  } else {
    return (
      <React.Fragment>
        <div className="bg-info p-5 rounded">
          <h1>répondez s'il vous plaît</h1>
          <p className="lead">{localizations['executiveSummary']}</p>
          <button type="button" className="btn btn-lg btn-primary" data-bs-toggle="modal" data-bs-target="#postEventModal">
            {localizations['createRepliesPage']} &raquo;
          </button>
          <p>{localizations['reassurance']}</p>
        </div>

        <div className="modal fade" id="postEventModal" tabIndex={-1} aria-labelledby="postEventModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="postEventModalLabel"><i className="bi bi-shield-exclamation"></i></h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {localizations['legalese.cya']}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{localizations['no']}</button>
                <form onSubmit={handlePostEvent}>
                  <button type="submit" className="btn btn-primary">{localizations['yes']}</button>
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
