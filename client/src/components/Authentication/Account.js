import React, { createContext, useState } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Pool from "./UserPool";
import axios from "axios";

const AccountContext = createContext();

const Account = (props) => {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState("");
  const [userAttr, setUserAttr] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const getSession = async () =>
    await new Promise((resolve, reject) => {
      const user = Pool.getCurrentUser();
      if (user) {
        user.getSession(async (err, session) => {
          if (err) {
            reject();
          } else {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err);
                } else {
                  const results = {};

                  for (let attribute of attributes) {
                    const { Name, Value } = attribute;
                    results[Name] = Value;
                  }
                  setUserEmail(results.email);
                  axios.post("/drive/email", results.email);
                  resolve(results);
                }
              });
            });

            resolve({
              user,
              ...session,
              ...attributes,
            });
          }
        });
      } else {
        reject();
      }
    });

  const authenticate = async (Username, Password) =>
    await new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username, Pool });
      const authDetails = new AuthenticationDetails({ Username, Password });

      user.authenticateUser(authDetails, {
        onSuccess: (data) => {
          console.log("onSuccess:", data);
          setLogin(true);
          resolve(data);
        },

        onFailure: (err) => {
          console.error("onFailure:", err);
          setLogin(false);
          reject(err);
        },

        newPasswordRequired: (data) => {
          console.log("newPasswordRequired:", data);
          setIsFirstLogin(true);
          setUser(user);
          setUserAttr(data);

          resolve(data);
        },
      });
    });

  const logout = () => {
    const user = Pool.getCurrentUser();
    if (user) {
      user.signOut();
      window.location.reload(false);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        authenticate,
        getSession,
        logout,
        login,
        isFirstLogin,
        user,
        userAttr,
        userEmail,
      }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export { Account, AccountContext };
