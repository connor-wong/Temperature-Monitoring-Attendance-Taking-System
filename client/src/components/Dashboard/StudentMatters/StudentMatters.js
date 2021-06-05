import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Container,
  Toast,
  Button,
  OverlayTrigger,
  Popover,
  ListGroup,
  ButtonGroup,
} from "react-bootstrap";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const StudentMatters = (props) => {
  const temperatureMatterArray = props.temperatureMatter;
  const lowAttendanceMatterArray = props.lowAttendanceMatter;
  const isLoading = props.isLoading;

  const [absentList, setAbsentList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    let mounted = true;
    let classArray = [];
    let absentArray = [];
    let absentList = [];

    const processData = () => {
      lowAttendanceMatterArray.forEach((student) => {
        classArray.push(student.Class);
      });

      classArray = [...new Set(classArray)];

      classArray.forEach((classTitle) => {
        absentArray = lowAttendanceMatterArray.filter((res) =>
          res.Class.includes(classTitle)
        );
        absentList.push({
          Class: classTitle,
          Student: absentArray,
        });
      });

      if (mounted) {
        setAbsentList(absentList);
      }
    };

    processData();
    return () => {
      mounted = false;
    };
  }, [lowAttendanceMatterArray]);

  const clickHandler = (e) => {
    let selectedList = [];

    selectedList = lowAttendanceMatterArray.filter((res) =>
      res.Class.includes(e.target.value)
    );

    setSelectedList(selectedList);
  };

  const popover = (
    <Popover style={{ width: "100%" }}>
      <Popover.Title as="h3" style={{ fontWeight: "bold", color: "#535353" }}>
        Students
      </Popover.Title>
      <Popover.Content style={{ backgroundColor: "#3e4ccd" }}>
        <ListGroup>
          {selectedList.map((result, index) => {
            return (
              <ListGroup.Item key={index}>
                <Row>
                  <Col
                    xl={8}
                    lg={8}
                    md={8}
                    sm={8}
                    xs={8}
                    style={{
                      textAlign: "left",
                      fontWeight: "bold",
                      color: "#535353",
                    }}
                  >
                    {result.Name}
                  </Col>
                  <Col
                    xl={4}
                    lg={4}
                    md={4}
                    sm={4}
                    xs={4}
                    style={{
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "#535353",
                    }}
                  >
                    {result.ID}
                  </Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Popover.Content>
    </Popover>
  );

  return (
    <Container className="student-matters text-center" fluid>
      <h3 style={{ color: "white", textAlign: "left" }}>Student Matters</h3>
      <Row style={{ marginBottom: "10px" }}>
        <Col xl={6} lg={6} md={6} sm={12} xs={12}>
          <h3 style={{ color: "white", fontSize: "22px", textAlign: "left" }}>
            High Temperature
          </h3>

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
            <>
              {temperatureMatterArray.length === 0 && (
                <h3 style={{ color: "white" }}>No Data</h3>
              )}
              {temperatureMatterArray.length > 0 && (
                <Row style={{ marginBottom: "10px" }}>
                  {temperatureMatterArray.map((result, index) => {
                    return (
                      <Col xl={12} lg={12} md={12} sm={12} xs={12} key={index}>
                        <Toast style={{ marginBottom: "5px" }}>
                          <Toast.Header>
                            <strong className="mr-auto">{result.Name}</strong>
                            <strong>{result.Class}</strong>
                          </Toast.Header>
                          <Toast.Body
                            style={{
                              color: "#535353",
                              fontWeight: "bold",
                              textAlign: "left",
                            }}
                          >
                            {result.Temperature} °C &emsp; {result.Date}
                          </Toast.Body>
                        </Toast>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </>
          )}
        </Col>

        <Col xl={6} lg={6} md={6} sm={12} xs={12}>
          <h3 style={{ color: "white", fontSize: "22px", textAlign: "left" }}>
            Low Attendance
          </h3>
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
            <>
              {absentList.length === 0 && (
                <h3 style={{ color: "white" }}>No Data</h3>
              )}
              {absentList.length > 0 && (
                <Row>
                  {absentList.map((result, index) => {
                    return (
                      <Col xl={12} lg={12} md={12} sm={12} xs={12} key={index}>
                        <OverlayTrigger
                          trigger="click"
                          placement="bottom"
                          overlay={popover}
                        >
                          <ButtonGroup
                            className="mb-2"
                            style={{ width: "100%" }}
                          >
                            <Button
                              style={{
                                color: "#535353",
                                backgroundColor: "white",
                                fontWeight: "bold",
                                borderColor: "white",
                              }}
                              value={result.Class}
                              onClick={(e) => clickHandler(e)}
                            >
                              {result.Class}
                            </Button>
                            <Button
                              style={{
                                color: "white",
                                backgroundColor: "#CDBF3E",
                                fontWeight: "bold",
                                borderColor: "#CDBF3E",
                              }}
                              value={result.Class}
                              onClick={(e) => clickHandler(e)}
                            >
                              {result.Student.length} ALERTS
                            </Button>
                          </ButtonGroup>
                        </OverlayTrigger>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentMatters;
