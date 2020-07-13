import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.min.js";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/flexlayout-react/style/dark.css'
import App from './layouts/App'
import "./style/index-css";
import { I18nextProvider } from "react-i18next";
import i18n from "./conponents/translate/i18n";


ReactDOM.render(<I18nextProvider i18n={i18n}><App /></I18nextProvider>, document.getElementById("root"));
