import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { Account } from "./components/Authentication/Account";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

ReactDOM.render(
  <Account>
    <App />
  </Account>,

  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();
