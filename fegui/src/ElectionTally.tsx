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

import React, { useContext } from "react";
import { Availability, ElectionT } from "./Electioins";
import ElectionVote from "./ElectionVote";
import { l10nContext } from "./l10nContext";

interface ElectionTallyProps {
  election: ElectionT;
  token: string;
  timeZones: Array<string>;
  saveVote: (
    name: string,
    availability: Map<string, Availability>,
    timeZone?: string
  ) => void;
}

function prettyLocalDateTimeString(locale: string, dateTime: string) {
  if (dateTime) {
    return new Date(dateTime).toLocaleString(locale, {
      dateStyle: "full",
      timeStyle: "short",
    });
  }
}

function ElectionTally(props: ElectionTallyProps) {
  console.log("ElectionTally props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, description, timeZone, candidates, votes } = props.election;
  candidates.sort();

  const timeZones = props.timeZones.map((tz) => (
    <li key={tz}>
      <a
        className="dropdonw-item"
        href={`/elections/${id}/tally?timeZone=${tz}#${props.token}`}
      >
        {tz}
      </a>
    </li>
  ));

  const cN = (bla: string) => {
    if (bla === "No") {
      return "table-danger";
    } else if (bla === "IfNeedBe") {
      return "table-warning";
    } else if (bla === "Yes") {
      return "table-success";
    } else {
      return "tja";
    }
  };

  return (
    <React.Fragment>
      <blockquote className="blockquote">
        {description
          ? description.split("\n").map((line) => <p>{line}</p>)
          : ""}
      </blockquote>
      <form>
        <table className="table table-bordered">
          <thead>
            <tr className="table-info">
              <th>
                {timeZone ? (
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-link dropdown-toggle"
                      type="button"
                      id="dropdownMenuLink"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {localizations["votes.convertToDifferentTimeZone"]}
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      {timeZones}
                    </ul>
                  </div>
                ) : (
                  ""
                )}
              </th>
              {candidates.map((candidate) => (
                <th>
                  {prettyLocalDateTimeString(
                    localizations["locale"],
                    candidate
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote) => (
              <tr>
                <td>{vote.name}</td>
                {candidates.map((c) => (
                  <td
                    className={cN(
                      new Map(Object.entries(vote.availability)).get(
                        c.substring(0, c.indexOf("T") + 6)
                      )
                    )}
                  >
                    &nbsp;
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => alert("Hello, world!")}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <ElectionVote election={props.election} saveVote={props.saveVote} />
          </tfoot>
        </table>
      </form>
    </React.Fragment>
  );
}

export default ElectionTally;
