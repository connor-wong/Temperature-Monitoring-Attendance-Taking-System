import React, { useState, useContext } from "react";
import { AccountContext } from "./Account";

import { Row, Col, Container, Form, Button } from "react-bootstrap";

const NewPassword = () => {
  const { user, userAttr } = useContext(AccountContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const changePassword = (event) => {
    event.preventDefault();

    delete userAttr.email_verified;

    if (password !== confirmPassword) {
      setMessage("Passwords does not match.");
      //console.error("Passwords are not the same");
      return;
    } else {
      user.completeNewPasswordChallenge(password, userAttr, {
        onSuccess: (result) => {
          setMessage("New password created successfully.");
          console.log(result);
          window.location.reload(false);
        },
        onFailure: (err) => {
          setMessage("Error, please contact administrator.");
          console.log(err);
        },
      });
    }
  };

  return (
    <div>
      <Container className="newpassword" fluid>
        <Row>
          <Col>
            <h3
              style={{
                fontSize: "calc(1rem + 2vw)",
                fontWeight: "bold",
              }}
            >
              Logging in for the first time?
            </h3>
            <h3
              style={{
                fontSize: "calc(1rem + 1vw)",
                fontWeight: "normal",
                color: "#848484",
              }}
            >
              Set your new password
            </h3>
            <Form onSubmit={changePassword}>
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
            <Button
              style={{
                width: "100%",
                backgroundColor: "#3241c9",
                fontSize: "22px",
                marginBottom: "10px",
              }}
              onClick={() => {
                window.location.reload(false);
              }}
            >
              Cancel
            </Button>
            <h3
              style={{
                fontSize: "18px",
                color: "red",
                textAlign: "center",
              }}
            >
              {message}
            </h3>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NewPassword;
