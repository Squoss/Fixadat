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
import { Availability, ElectionT, Vote } from "./Elections";
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
  deleteVote: (name: string, voted: Date) => void;
}

function prettyLocalDateTimeString(locale: string, dateTime: string) {
  if (dateTime) {
    return new Date(dateTime).toLocaleString(locale, {
      dateStyle: "full",
      timeStyle: "short",
    });
  }
}

function columnsAll(candidates: Array<string>, votes: Array<Vote>) {
  const columnCounts = new Array<[number, number, number]>(0);
  candidates.forEach(() => {
    columnCounts.push([0, 0, 0]);
  });
  votes.forEach((vote) => {
    candidates.forEach((candidate, ccIndex) => {
      const [y, inb, n] = columnCounts[ccIndex];
      const bla = new Map(Object.entries(vote.availability)).get(
        candidate.substring(0, candidate.indexOf("T") + 6)
      );
      if (bla === undefined) {
        // yep, nothing!
      } else if (bla === "No") {
        columnCounts[ccIndex] = [y, inb, n + 1];
      } else if (bla === "IfNeedBe") {
        columnCounts[ccIndex] = [y, inb + 1, n];
      } else if (bla === "Yes") {
        columnCounts[ccIndex] = [y + 1, inb, n];
      } else {
        throw new Error("unmapped enum value");
      }
    });
  });
  return columnCounts;
}

function columnBest(columnCounts: Array<[number, number, number]>) {
  let best = [0, 0, 0];
  columnCounts.forEach((columnCount) => {
    const [y, inb] = columnCount;
    if (
      y + inb > best[0] + best[1] ||
      (y + inb === best[0] + best[1] && y > best[0])
    ) {
      best = columnCount;
    }
  });
  return best;
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

  const cN = (bla?: string) => {
    if (bla === undefined) {
      return "table-light";
    }

    if (bla === "No") {
      return "table-danger";
    } else if (bla === "IfNeedBe") {
      return "table-warning";
    } else if (bla === "Yes") {
      return "table-success";
    } else {
      throw new Error("unmapped enum value");
    }
  };

  const columnCounts = columnsAll(candidates, votes);
  const best = columnBest(columnCounts);

  const deleteVote = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    name: string,
    voted: Date
  ) => {
    e.preventDefault();
    if (
      window.confirm(
        localizations["votes.revocationConfirmation"]
          .replace("{0}", name)
          .replace(
            "{1}",
            new Date(voted).toLocaleDateString(localizations["locale"], {
              dateStyle: "full",
            })
          )
      )
    ) {
      props.deleteVote(name, voted);
    }
  };

  return (
    <React.Fragment>
      <blockquote className="blockquote">
        {description
          ?.split("\n")
          .map((line, i) => <p key={`l${i}`}>{line}</p>) ?? ""}
      </blockquote>
      <form>
        <table className="table table-bordered">
          <thead>
            <tr className="table-info">
              <th>
                {timeZone ? (
                  <React.Fragment>
                    {localizations["datesAndTimes.timeZone"]}: {timeZone}
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
                  </React.Fragment>
                ) : (
                  ""
                )}
              </th>
              {candidates.map((candidate, i) => (
                <th key={`c${i}`}>
                  {prettyLocalDateTimeString(
                    localizations["locale"],
                    candidate
                  )}
                </th>
              ))}
              <th></th>
            </tr>
            <tr>
              <th></th>
              {columnCounts.map((yinbn, i) => (
                <th
                  key={`cc${i}`}
                  className={
                    best[0] === yinbn[0] &&
                    best[1] === yinbn[1] &&
                    best[2] === yinbn[2]
                      ? "table-primary"
                      : "table-secondary"
                  }
                >
                  {yinbn[0] + yinbn[1]} ({yinbn[0]}:{yinbn[1]})
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote, i) => (
              <tr key={`v${i}`}>
                <td>{vote.name}</td>
                {candidates.map((c, j) => (
                  <td
                    key={`v${i}c${j}`}
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
                    onClick={(e) => deleteVote(e, vote.name, vote.voted)}
                  >
                    {localizations["votes.revoke"]}{" "}
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
