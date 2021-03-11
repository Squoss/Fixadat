import React from 'react';
import { Link, NavLink, Redirect, Route, Switch } from 'react-router-dom';

import Abode from './Abode';
import NotFound from './NotFound';
import ToDo from './ToDo';

function App() {
  return (
    <React.Fragment>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Squawg</Link> <a className="navbar-brand" href="https://io.squeng.com/abode/" target="Squeng"><small>Squeng<sup>&reg;</sup>&nbsp;made</small></a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <NavLink className="nav-link" exact={true} activeClassName="active" aria-current="page" to="/"><i className="bi-house"></i></NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" activeClassName="active" to="/acknowledgements">Acknowledgements</NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="legalese" role="button" data-bs-toggle="dropdown" aria-expanded="false">Legalese</a>
                <ul className="dropdown-menu" aria-labelledby="legalese">
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/im">Imprint / Masthead</NavLink></li>
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/pp">Privacy Policy</NavLink></li>
                  <li><NavLink className="dropdown-item" activeClassName="disabled" to="/legalese/tos">Terms of Service</NavLink></li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" href="#" tabIndex={-1} aria-disabled="true">Prices</a>
              </li>
            </ul>
            <div className="dropdown">
              <a className="btn btn-primary dropdown-toggle" href="#" role="button" id="language" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi-globe"></i></a>
              <ul className="dropdown-menu" aria-labelledby="language">
                <li><a className="dropdown-item disabled" href="#">Deutsch</a></li>
                <li><a className="dropdown-item" href="#">English</a></li>
              </ul>
            </div>
              &nbsp;
              <a className="btn btn-secondary" href="https://github.com/Squoss/Squawg" target="GitHub"><i className="bi-github"></i></a>
          </div>
        </div>
      </nav>

      <main className="container">
        <Switch>
          <Route exact path="/" component={Abode} />
          <Route path="/events/:event" component={ToDo} />
          <Route path="/acknowledgements" component={ToDo} />
          <Route exact path="/legalese">
            <Redirect to="/legalese/im" />
          </Route>
          <Route path="/legalese/im" component={ToDo} />
          <Route path="/legalese/pp" component={ToDo} />
          <Route path="/legalese/tos" component={ToDo} />
          {/* when none of the above match, <NotFound> will be rendered */}
          <Route component={NotFound} />
        </Switch>
      </main>

      <footer className="fixed-bottom">
        <div className="card text-end">
          <div className="card-body">
            Copyright &copy; <time dateTime="2021">2021</time> Squeng AG
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}

export default App;
