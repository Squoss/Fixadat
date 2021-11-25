import { Modal } from "bootstrap";
import React, { useContext, useEffect } from 'react';
import { Link, NavLink, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Abode from './Abode';
import EventComponent from './EventComponent';
import { l10nContext } from './l10nContext';
import NotFound from './NotFound';
import ToDo from './ToDo';


function App(props: {}) {
  console.log("App props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const location = useLocation();
  let locationString = location.pathname;
  locationString += "?";
  new URLSearchParams(location.search).forEach((v, k) => locationString += k !== "locale" ? `${k}=${v}&` : "");
  locationString += "locale=NEWLOCALE";
  locationString += location.hash;

  useEffect(() => {
    const teachingObjectFlag = window.sessionStorage.getItem("teachingObject");
    if ( teachingObjectFlag === null ) {
      const modal = new Modal(document.getElementById('teachingObjectModal')!);
      modal.show();
      window.sessionStorage.setItem("teachingObject", "shown");
    }
  }, []);

  return (
    <React.Fragment>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-info">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Squawg</Link> <a className="navbar-brand" href="https://io.squeng.com/abode/" target="Squeng"><small>Squeng<sup>&reg;</sup>&nbsp;made</small></a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <NavLink className="nav-link" exact={true} activeClassName="active" aria-current="page" to="/"><i className="bi bi-house"></i></NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" activeClassName="active" to="/acknowledgements">{localizations['acknowledgements']}</NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="legalese" role="button" data-bs-toggle="dropdown" aria-expanded="false">{localizations['legalese']}</a>
                <ul className="dropdown-menu" aria-labelledby="legalese">
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/im">{localizations['legalese.masthead']}</NavLink></li>
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/pp">{localizations['legalese.pp']}</NavLink></li>
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/tos">{localizations['legalese.tos']}</NavLink></li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link disabled" tabIndex={-1} aria-disabled="true" activeClassName="active" to="/prices">{localizations['prices']}</NavLink>
              </li>
            </ul>
            <div className="dropdown">
              <button className="btn btn-outline-primary dropdown-toggle" type="button" id="language" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-globe"></i></button>
              <ul className="dropdown-menu" aria-labelledby="language">
                <li><a className={localizations['locale'] === "de" ? "dropdown-item disabled" : "dropdown-item"} href={locationString.replace("NEWLOCALE", "de")}>Deutsch</a></li>
                <li><a className={localizations['locale'] === "en" ? "dropdown-item disabled" : "dropdown-item"} href={locationString.replace("NEWLOCALE", "en")}>English</a></li>
              </ul>
            </div>
            &nbsp;
            <a className="btn btn-outline-secondary" href="https://github.com/Squoss/Squawg" target="GitHub"><i className="bi bi-github"></i></a>
          </div>
        </div>
      </nav>

      <main className="container">
        <Switch>
          <Route exact path="/"><Abode /></Route>
          <Route path="/events/:event"><EventComponent /></Route>
          <Route path="/acknowledgements" ><ToDo /></Route>
          <Route exact path="/legalese">
            <Redirect to="/legalese/im" />
          </Route>
          <Route path="/legalese/im" ><ToDo /></Route>
          <Route path="/legalese/pp"><ToDo /></Route>
          <Route path="/legalese/tos" ><ToDo /></Route>
          {/* when none of the above match, <NotFound> will be rendered */}
          <Route ><NotFound /></Route>
        </Switch>
      </main>

      <footer className="fixed-bottom">
        <div className="card text-center">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <Link className="link-info text-decoration-none" to="/legalese/im">{localizations['legalese.masthead']}</Link>
              </div>
              <div className="col">
                <Link className="link-info text-decoration-none" to="/legalese/pp">{localizations['legalese.pp']}</Link>
              </div>
              <div className="col">
                <Link className="link-info text-decoration-none" to="/legalese/tos">{localizations['legalese.tos']}</Link>
              </div>
              <div className="col">
                Copyright &copy; <time dateTime="2021">2021</time> Squeng AG
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="modal fade" id="teachingObjectModal" tabIndex={-1} aria-labelledby="teachingObjectModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="teachingObjectModalLabel"><i className="bi bi-book-half"></i> {localizations['readMe']}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row align-items-center">
                <div className="col">
                  <p className="fs-1" dangerouslySetInnerHTML={{ __html: localizations['HTML.teachingObject'] }}></p>
                </div>
                <div className="col">
                  <iframe width='200' height='400' src='https://leanpub.com/DevWebApps/embed' frameBorder='0' allowTransparency={true}></iframe>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal">{localizations['gotIt']}</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;
