import React, { useContext, useState } from "react";
import { Button, Navbar, Nav, Spinner, Modal } from "react-bootstrap";
import { AccountContext } from "../Authentication/Account";
import ChangePassword from "../Authentication/ChangePassword";

const NavBar = () => {
  const { logout, userEmail } = useContext(AccountContext);
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  if (isLoading) {
    setTimeout(() => {
      logout();
    }, 1500);
  }

  return (
    <>
      <Navbar className="navbar" collapseOnSelect expand="lg">
        <Navbar.Brand style={{ display: "flex" }}>
          <h3
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            RASPITAR
          </h3>
          <h3
            style={{
              textDecoration: "underline",
              marginLeft: "10px",
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            WEB
          </h3>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          style={{ backgroundColor: "white" }}
        />
        <Navbar.Collapse
          className="justify-content-end"
          id="responsive-navbar-nav"
        >
          <Nav>
            <Navbar.Text
              style={{
                marginRight: "10px",
                marginBottom: "10px",
                color: "white",
                fontSize: "18px",
              }}
            >
              Signed in as: {userEmail}
            </Navbar.Text>
            <Button
              style={{
                marginRight: "10px",
                marginBottom: "10px",
                backgroundColor: "white",
                color: "black",
                fontWeight: "bold",
                fontSize: "18px",
              }}
              onClick={() => setChangePassword(true)}
            >
              Change Password
            </Button>

            <Button
              style={{
                marginRight: "10px",
                marginBottom: "10px",
                backgroundColor: "white",
                color: "black",
                fontWeight: "bold",
                fontSize: "18px",
              }}
              onClick={() => {
                setIsLoading(true);
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
                <span>Log Out</span>
              )}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Modal
        onHide={() => setChangePassword(false)}
        show={changePassword}
        size="lg"
        centered
      >
        <Modal.Header>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ChangePassword />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setChangePassword(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavBar;
