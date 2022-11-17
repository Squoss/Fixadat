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

import { useContext } from "react";
import { Link } from "react-router-dom";
import { l10nContext } from "./l10nContext";

function NotFound(props: {}) {
  console.log("NotFound props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  return (
    <div className="alert alert-info" role="alert">
      <h4 className="alert-heading">{localizations["notFound.title"]}</h4>
      <p>{localizations["notFound.page"]}</p>
      <hr />
      <p className="mb-0">
        <Link to="/" className="alert-link">
          <i className="bi bi-house"></i>
        </Link>
      </p>
    </div>
  );
}

export default NotFound;
