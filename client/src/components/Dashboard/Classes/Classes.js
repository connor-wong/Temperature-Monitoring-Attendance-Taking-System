import React, { useState } from "react";
import { Row, Col, Container, Button, Modal } from "react-bootstrap";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import AttendanceList from "./AttendanceList";
import StudentList from "../StudentList";

const Classes = (props) => {
  const classArray = props.classes;
  const isLoading = props.isLoading;
  const setUpdateData = props.setUpdateData;

  const [showModal, setShowModal] = useState(false);
  const [classTitle, setClassTitle] = useState("");
  const [option, setOption] = useState("");

  return (
    <>
      <Container className="classes text-center" fluid>
        <Row>
          <Col>
            <h3 style={{ color: "white", textAlign: "left" }}>Your Classes</h3>
          </Col>
        </Row>
        {isLoading ? (
          <Row style={{ marginBottom: "10px", textAlign: "left" }}>
            <Col>
              <SkeletonTheme color="#2e3896" highlightColor="#1f276e">
                <Skeleton
                  count={1}
                  height={30}
                  width={`60%`}
                  style={{ marginBottom: "10px" }}
                />
                <Skeleton
                  count={3}
                  height={30}
                  width={`100%`}
                  style={{ marginBottom: "10px" }}
                />
                <Skeleton count={1} height={30} width={`80%`} />
                <Skeleton
                  count={1}
                  height={30}
                  width={`60%`}
                  style={{ marginBottom: "10px" }}
                />
                <Skeleton
                  count={3}
                  height={30}
                  width={`100%`}
                  style={{ marginBottom: "10px" }}
                />
                <Skeleton count={1} height={30} width={`80%`} />
              </SkeletonTheme>
            </Col>
          </Row>
        ) : (
          <Row>
            {classArray.map((result) => {
              return (
                <Col
                  xl={4}
                  lg={4}
                  md={4}
                  sm={6}
                  xs={6}
                  key={result.properties.title}
                >
                  <Button
                    size="lg"
                    block={true}
                    style={{
                      backgroundColor: "white",
                      color: "#535353",
                      marginBottom: "20px",
                      width: "100%",
                      height: "10vh",
                      fontSize: "calc(10px + 1.2vw)",
                      fontWeight: "bold",
                      borderRadius: "10px",
                    }}
                    id={result.properties.title}
                    onClick={(e) => {
                      setShowModal(true);
                      setClassTitle(e.target.id);
                      axios.post("/sheet/class", e.target.id);
                    }}
                  >
                    {result.properties.title}
                  </Button>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
      <Modal
        className="text-center"
        size="lg"
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setOption("");
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h3 style={{ fontWeight: "bold", color: "#535353" }}>
              {classTitle}
            </h3>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Button
                xl={6}
                lg={6}
                md={6}
                sm={6}
                xs={6}
                style={{
                  width: "100%",
                  backgroundColor: "#3e4ccd",
                  fontWeight: "bold",
                }}
                onClick={() => setOption("Attendance")}
              >
                Attendance
              </Button>
            </Col>
            <Col xl={6} lg={6} md={6} sm={6} xs={6}>
              <Button
                style={{
                  width: "100%",
                  backgroundColor: "#3e4ccd",
                  fontWeight: "bold",
                }}
                onClick={() => setOption("Student")}
              >
                Students
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              {option === "Attendance" && (
                <AttendanceList setUpdateData={setUpdateData} />
              )}
              {option === "Student" && <StudentList />}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Classes;
