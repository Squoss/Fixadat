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
import React, { useContext, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { l10nContext } from "./l10nContext";

function App(props: {}) {
  console.log("App props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const location = useLocation();
  let locationString = location.pathname;
  locationString += "?";
  new URLSearchParams(location.search).forEach(
    (v, k) => (locationString += k !== "locale" ? `${k}=${v}&` : "")
  );
  locationString += "locale=NEWLOCALE";
  locationString += location.hash;

  useEffect(() => {
    const cookieConsentFlag = window.sessionStorage.getItem("cookieConsent");
    if (cookieConsentFlag === null) {
      const modal = new Modal(document.getElementById("cookieConsentModal")!);
      modal.show();
      window.sessionStorage.setItem("cookieConsent", "shown");
    }
  }, []);

  return (
    <React.Fragment>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Fixadat
          </Link>{" "}
          <a
            className="navbar-brand"
            href="https://www.squeng.com/"
            target="Squeng"
          >
            <small>
              Squeng<sup>&reg;</sup>&nbsp;made
            </small>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  aria-current="page"
                  to="/"
                >
                  <i className="bi bi-house"></i>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "disabled nav-link active" : "disabled nav-link"
                  }
                  tabIndex={-1}
                  aria-disabled="true"
                  to="/acknowledgements"
                >
                  {localizations["acknowledgements"]}
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/legalese"
                  id="legalese"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {localizations["legalese"]}
                </a>
                <ul className="dropdown-menu" aria-labelledby="legalese">
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "dropdown-item disabled" : "dropdown-item"
                      }
                      to="/legalese/im"
                    >
                      {localizations["legalese.masthead"]}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "dropdown-item disabled" : "dropdown-item"
                      }
                      to="/legalese/pp"
                    >
                      {localizations["legalese.pp"]}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "dropdown-item disabled" : "dropdown-item"
                      }
                      to="/legalese/tos"
                    >
                      {localizations["legalese.tos"]}
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/prices"
                >
                  {localizations["prices"]}
                </NavLink>
              </li>
            </ul>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                id="language"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-globe"></i>
              </button>
              <ul className="dropdown-menu" aria-labelledby="language">
                <li>
                  <a
                    className={
                      localizations["locale"] === "de"
                        ? "dropdown-item disabled"
                        : "dropdown-item"
                    }
                    href={locationString.replace("NEWLOCALE", "de")}
                  >
                    Deutsch
                  </a>
                </li>
                <li>
                  <a
                    className={
                      localizations["locale"] === "en"
                        ? "dropdown-item disabled"
                        : "dropdown-item"
                    }
                    href={locationString.replace("NEWLOCALE", "en")}
                  >
                    English
                  </a>
                </li>
              </ul>
            </div>
            &nbsp;
            <a
              className="btn btn-outline-light"
              href="https://github.com/Squoss/Fixadat"
              target="GitHub"
            >
              <i className="bi bi-github"></i>
            </a>
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>

      <footer className="d-none d-sm-block fixed-bottom">
        <div className="card text-center">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <Link
                  className="link-dark text-decoration-none"
                  to="/legalese/im"
                >
                  {localizations["legalese.masthead"]}
                </Link>
              </div>
              <div className="col">
                <Link
                  className="link-dark text-decoration-none"
                  to="/legalese/pp"
                >
                  {localizations["legalese.pp"]}
                </Link>
              </div>
              <div className="col">
                <Link
                  className="link-dark text-decoration-none"
                  to="/legalese/tos"
                >
                  {localizations["legalese.tos"]}
                </Link>
              </div>
              <div className="col">
                Copyright &copy; <time dateTime="2021">2021</time>-
                <time dateTime="2022">2022</time> Squeng AG
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div
        className="modal fade"
        id="cookieConsentModal"
        tabIndex={-1}
        aria-labelledby="cookieConsentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="cookieConsentModalLabel">
                🥠
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>🍪</p>
              <p>
                reminder to myself:{" "}
                <a
                  href="https://usercentrics.com/press/usercentrics-and-cookiebot-unite/"
                  target="Cavalry"
                >
                  Cookiebot o.ä.
                </a>{" "}
                verwenden
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                {localizations["gotIt"]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;
