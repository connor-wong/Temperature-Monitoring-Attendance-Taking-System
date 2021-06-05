import React, { useState, useContext } from "react";
import { AccountContext } from "./Account";
import { Row, Col, Container, Form, Button, Spinner } from "react-bootstrap";

import NewPassword from "./NewPassword";
import ForgetPassword from "./ForgetPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { authenticate, isFirstLogin } = useContext(AccountContext);

  const onSubmit = (event) => {
    event.preventDefault();

    authenticate(email, password)
      .then((data) => {
        console.log("Logged in!", data);
        setIsLoading(true);
      })

      .catch((err) => {
        console.error("Failed to login!", err);
        setMessage("Incorrect username or password.");
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Container className="login text-center" fluid>
        <Row style={{ height: "100vh" }}>
          <Col className="login-left" xl={6} lg={12} md={12} sm={12} xs={12}>
            <div className="login-title">
              <h3>RASPITAR</h3>
              <h3 style={{ textDecoration: "underline" }}>WEB</h3>
            </div>
          </Col>

          <Col className="login-right" xl={6} lg={12} md={12} sm={12} xs={12}>
            <Row>
              <Col className="login-area">
                {isFirstLogin ? (
                  <NewPassword />
                ) : (
                  <>
                    {stage === 1 ? (
                      <>
                        <h3
                          style={{
                            fontSize: "calc(2rem + 2vw)",
                            fontWeight: "bold",
                            textAlign: "left",
                          }}
                        >
                          Hello there,
                        </h3>
                        <h3
                          style={{
                            fontSize: "calc(1rem + 1vw)",
                            fontWeight: "normal",
                            color: "#848484",
                            textAlign: "left",
                          }}
                        >
                          Login to your account
                        </h3>
                        <Form onSubmit={onSubmit}>
                          <Form.Group controlId="formBasicEmail">
                            <Form.Control
                              type="email"
                              placeholder="Email"
                              onChange={(event) => setEmail(event.target.value)}
                            />
                          </Form.Group>

                          <Form.Group controlId="formBasicPassword">
                            <Form.Control
                              type="password"
                              placeholder="Password"
                              onChange={(event) =>
                                setPassword(event.target.value)
                              }
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
                              <span>Log in</span>
                            )}
                          </Button>
                        </Form>
                        <Button
                          variant="primary"
                          type="submit"
                          style={{
                            width: "100%",
                            backgroundColor: "#3241c9",
                            fontSize: "22px",
                            marginBottom: "10px",
                          }}
                          onClick={() => {
                            setStage(2);
                          }}
                        >
                          Forget Password
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
                      </>
                    ) : (
                      <ForgetPassword />
                    )}
                  </>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
