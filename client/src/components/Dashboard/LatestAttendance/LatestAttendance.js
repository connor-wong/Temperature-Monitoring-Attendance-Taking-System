import React, { useState } from "react";
import axios from "axios";
import { Row, Col, Container, Button, Modal, Toast } from "react-bootstrap";
import { VictoryPie, VictoryLabel } from "victory";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import SelectedAttendance from "./SelectedAttendance";
import StudentList from "../StudentList";

const LatestAttendance = (props) => {
  const attendanceArray = props.attendance;
  const isLoading = props.isLoading;
  const setUpdateData = props.setUpdateData;

  const [showModal, setShowModal] = useState(false);
  const [classTitle, setClassTitle] = useState("");
  const [date, setDate] = useState("");
  const [option, setOption] = useState("");

  const selectHandler = (e) => {
    axios.post("/sheet/class", e.target.id);

    setShowModal(true);
    setDate(e.currentTarget.value);
    setClassTitle(e.target.id);
  };

  return (
    <>
      <Container className="latest-attendance text-center" fluid>
        <h3 style={{ color: "white", textAlign: "left" }}>Latest Attendance</h3>

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
              </SkeletonTheme>
            </Col>
          </Row>
        ) : (
          <Row>
            {attendanceArray.map((result) => {
              return (
                <Col xl={4} lg={4} md={4} sm={12} xs={12} key={result.Class}>
                  <Toast
                    style={{
                      backgroundColor: "white",
                      borderRadius: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <Toast.Header>
                      <strong className="mr-auto">{result.Date} </strong>
                      <strong>{result.Class}</strong>
                    </Toast.Header>
                    <Toast.Body>
                      <svg viewBox="0 0 400 400">
                        <VictoryPie
                          standalone={false}
                          padAngle={0}
                          innerRadius={110}
                          width={400}
                          height={400}
                          data={[
                            { key: "", y: result.Present },
                            {
                              key: "",
                              y: result.Total_Students - result.Present,
                            },
                          ]}
                          colorScale={["#3e4ccd", "#EEEEEE"]}
                          style={{ labels: { display: "none" } }}
                        />
                        <VictoryLabel
                          textAnchor="middle"
                          style={{
                            fontSize: "50px",
                            fontWeight: "bold",
                            fill: "#535353",
                          }}
                          x={200}
                          y={200}
                          text={result.Present + " / " + result.Total_Students}
                        />
                      </svg>

                      <Button
                        id={result.Class}
                        value={result.Date}
                        onClick={(e) => {
                          selectHandler(e);
                        }}
                        style={{
                          backgroundColor: "#3e4ccd",
                          width: "90%",
                          fontWeight: "bold",
                        }}
                      >
                        Explore
                      </Button>
                    </Toast.Body>
                  </Toast>
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
                onClick={() => setOption("View")}
              >
                View
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
              {option === "View" && (
                <SelectedAttendance date={date} setUpdateData={setUpdateData} />
              )}
              {option === "Student" && <StudentList />}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LatestAttendance;
