import React, { useState, useEffect, useContext } from "react";
import { AccountContext } from "./components/Authentication/Account";

import Login from "./components/Authentication/Login";
import Dashboard from "./components/Dashboard/Dashboard";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const { getSession } = useContext(AccountContext);

  useEffect(() => {
    getSession().then(() => {
      setTimeout(() => {
        setLoggedIn(true);
      }, 1500);
    });
  });

  return <>{loggedIn ? <Dashboard /> : <Login />}</>;
};

export default App;
