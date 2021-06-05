import React, { useState, useContext } from "react";
import { AccountContext } from "./Account";
import { Form, Button, Spinner } from "react-bootstrap";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { getSession, authenticate } = useContext(AccountContext);

  const onSubmit = (event) => {
    setIsLoading(true);
    event.preventDefault();

    getSession().then(({ user, email }) => {
      authenticate(email, password).then(() => {
        user.changePassword(password, newPassword, (err, result) => {
          if (err) {
            setMessage("Wrong Password");
            console.error(err);
          } else {
            console.log(result);
          }
        });
      });
    });
  };

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Control
            type="password"
            placeholder="Old Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="New Password"
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#3241c9",
            fontSize: "22px",
            marginBottom: "10px",
          }}
        >
          {isLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <span>Change Password</span>
          )}
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
      </Form>
    </>
  );
};

export default ChangePassword;
