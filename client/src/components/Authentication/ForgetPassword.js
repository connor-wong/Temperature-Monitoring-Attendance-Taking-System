import React, { useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import Pool from "./UserPool";

import { Form, Button } from "react-bootstrap";

const ForgetPassword = () => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const getUser = () => {
    return new CognitoUser({
      Username: email.toLowerCase(),
      Pool,
    });
  };

  const sendCode = (event) => {
    event.preventDefault();

    getUser().forgotPassword({
      onSuccess: (data) => {
        console.log("onSuccess:", data);
      },
      onFailure: (err) => {
        console.error("onFailure:", err);
      },
      inputVerificationCode: (data) => {
        console.log("Input code:", data);
        setStage(2);
      },
    });
  };

  const resetPassword = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords does not match.");
      //console.error("Passwords are not the same.");
      return;
    }

    getUser().confirmPassword(code, password, {
      onSuccess: (data) => {
        setMessage("Password reset successfully.");
        console.log("onSuccess:", data);
        window.location.reload(false);
      },
      onFailure: (err) => {
        setMessage("Incorrect verification code.");
        console.error("onFailure:", err);
      },
    });
  };

  return (
    <div>
      {stage === 1 && (
        <>
          <h3
            style={{
              fontSize: "calc(2rem + 2vw)",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Forget Password?
          </h3>
          <Form onSubmit={sendCode}>
            <Form.Group controlId="formBasicEmail">
              <Form.Control
                type="email"
                value={email}
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </Form.Group>
            <Button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "#3241c9",
                fontSize: "22px",
                marginBottom: "10px",
              }}
            >
              Send verification code
            </Button>
          </Form>
          <Button
            style={{
              width: "100%",
              backgroundColor: "#3241c9",
              fontSize: "22px",
            }}
            onClick={() => {
              window.location.reload(false);
            }}
          >
            Cancel
          </Button>
        </>
      )}

      {stage === 2 && (
        <>
          <h3
            style={{
              fontSize: "calc(2rem + 2vw)",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Set New Password
          </h3>
          <Form onSubmit={resetPassword}>
            <Form.Group controlId="formBasicEmail">
              <Form.Control
                value={code}
                placeholder="Verification Code"
                onChange={(event) => setCode(event.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicNewPassword">
              <Form.Control
                type="password"
                value={password}
                placeholder="New Password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicConfirmPassword">
              <Form.Control
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Form.Group>
            <Button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "#3241c9",
                fontSize: "22px",
                marginBottom: "10px",
              }}
            >
              Reset Password
            </Button>
          </Form>
          <h3
            style={{
              fontSize: "18px",
              color: "red",
              textAlign: "center",
            }}
          >
            {message}
          </h3>
        </>
      )}
    </div>
  );
};

export default ForgetPassword;
