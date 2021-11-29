import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import I18nApp from './I18nApp';

import 'bootswatch/dist/sketchy/bootstrap.min.css';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nApp />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
