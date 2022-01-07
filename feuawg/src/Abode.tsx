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

import { Modal } from "bootstrap";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "./fetchJson";
import { l10nContext } from "./l10nContext";

interface PostEventResponse {
  id: number;
  hostToken: string;
}

function Abode(props: {}) {
  console.log("Abode props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const navigate = useNavigate();

  const postEvent = () =>
    post<PostEventResponse>("/iapi/events")
      .then((responseJson) => {
        console.debug(responseJson.status);
        console.debug(responseJson.parsedBody);
        navigate(
          `/events/${responseJson.parsedBody?.id}?brandNew=true&view=host#${responseJson.parsedBody?.hostToken}`
        );
      })
      .catch((error) => console.error(`failed to post event: ${error}`));

  const handlePostEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    Modal.getInstance(document.getElementById("postEventModal")!)!.hide();
    postEvent();
  };

  return (
    <React.Fragment>
      <div className="bg-light p-5 border rounded">
        <h1>répondez s'il vous plaît</h1>
        <p className="lead">{localizations["executiveSummary"]}</p>
        <button
          type="button"
          className="btn btn-lg btn-dark"
          data-bs-toggle="modal"
          data-bs-target="#postEventModal"
        >
          {localizations["createRepliesPage"]} &raquo;
        </button>
        <p>{localizations["reassurance"]}</p>
      </div>

      <div
        className="modal fade"
        id="postEventModal"
        tabIndex={-1}
        aria-labelledby="postEventModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="postEventModalLabel">
                <i className="bi bi-shield-exclamation"></i>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{localizations["legalese.cya"]}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {localizations["no"]}
              </button>
              <form onSubmit={handlePostEvent}>
                <button type="submit" className="btn btn-primary">
                  {localizations["yes"]}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Abode;
