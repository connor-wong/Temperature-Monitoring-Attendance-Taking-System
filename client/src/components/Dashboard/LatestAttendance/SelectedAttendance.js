import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Container,
  Spinner,
  ListGroup,
  Button,
  Form,
} from "react-bootstrap";
import CsvDownload from "react-json-to-csv";
import AWS from "aws-sdk";

const SelectedAttendance = (props) => {
  const selectedDate = props.date;
  const setUpdateData = props.setUpdateData;

  const [isLoading, setIsLoading] = useState(true);
  const [isSave, setIsSave] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [studentList, setstudentList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [absentList, setAbsentList] = useState([]);
  const [editStatus, setEditStatus] = useState(false);
  const [removeStudents, setRemoveStudents] = useState([]);
  const [addStudents, setAddStudents] = useState([]);

  const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
    process.env;

  // AWS DynamoDB Config
  AWS.config.update({
    region: AWS_DEFAULT_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  const dynamodbClient = new AWS.DynamoDB.DocumentClient();
  const TABLE_NAME = "March";

  useEffect(() => {
    let mounted = true;
    let studentList = [];
    let absentList;

    const getData = async () => {
      const response = await fetch("/aws/api").then((res) => res.json()); // Get Student Attendance
      const studentArray = await fetch("/sheet/student").then((res) =>
        res.json()
      ); // Get Student List

      // Convert array to object
      studentArray.forEach((res) => {
        studentList.push({
          Name: res[0],
          ID: res[1],
        });
      });

      response.sort((a, b) => {
        // Sort to latest datex
        return new Date(b.Date) - new Date(a.Date);
      });

      const attendance = response.filter(
        (
          res // Filter Attendance By Selected Date
        ) => res.Date.includes(selectedDate)
      );

      // Filter absent students
      absentList = studentList.filter(
        ({ Name: id1 }) => !attendance.some(({ Name: id2 }) => id2 === id1)
      );

      if (mounted) {
        setSelectedClass(attendance[0].Class);
        setAttendanceList(attendance);
        setAbsentList(absentList);
        setstudentList(studentList);
        setIsLoading(false);
      }
    };
    getData();
    return () => {
      mounted = false;
    };
  }, [selectedDate]);

  const afterSaveHandler = async () => {
    const response = await fetch("/aws/api").then((res) => res.json()); // Get Student Attendance

    response.sort((a, b) => {
      // Sort to latest datex
      return new Date(b.Date) - new Date(a.Date);
    });

    const attendance = response.filter(
      (
        res // Filter Attendance By Selected Date
      ) => res.Date.includes(selectedDate)
    );

    // Filter absent students
    const absentList = studentList.filter(
      ({ Name: id1 }) => !attendance.some(({ Name: id2 }) => id2 === id1)
    );

    setAttendanceList(attendance);
    setAbsentList(absentList);
    setUpdateData(true);
  };

  const removeStudentHandler = (e, student) => {
    let checked = e.target.checked;
    let removeList = [...removeStudents];

    if (checked) {
      removeList = removeList.filter((item) => item.Name !== student.Name);
      setRemoveStudents(removeList);
    } else {
      removeList = [...removeStudents, student];
      setRemoveStudents(removeList);
    }
  };

  const addStudentHandler = (e, student) => {
    let checked = e.target.checked;
    let addList = [...addStudents];

    if (checked) {
      addList = [...addStudents, student];
      setAddStudents(addList);
    } else {
      addList = addList.filter((item) => item.Name !== student.Name);
      setAddStudents(addList);
    }
  };

  const saveHandler = () => {
    // Add Student
    addStudents.forEach((student) => {
      const saveParams = {
        TableName: TABLE_NAME,
        Item: {
          Date: selectedDate,
          Name: student.Name,
          Class: selectedClass,
          "Student ID": student.ID,
        },
      };

      dynamodbClient.put(saveParams, function (err, data) {
        if (err) {
          console.error(
            "Unable to add item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
        }
      });
    });

    //Remove Student
    removeStudents.forEach((student) => {
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: {
          Date: student.Date,
          Name: student.Name,
        },
      };

      dynamodbClient.delete(deleteParams, function (err, data) {
        if (err) {
          console.error(
            "Unable to delete item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
      });
    });

    setTimeout(() => {
      setIsSave(false);
      setEditStatus(false);
      setAddStudents([]);
      setRemoveStudents([]);
      afterSaveHandler();
    }, 1500);
  };

  return (
    <>
      <Container className="selected-attendance text-center" fluid>
        <Row>
          <Col>
            <h3
              style={{ fontWeight: "bold", color: "white", textAlign: "left" }}
            >
              {selectedDate}
            </h3>
          </Col>
        </Row>
        <Row>
          <Col>
            {isLoading ? (
              <Spinner animation="border" style={{ color: "white" }} />
            ) : (
              <ListGroup>
                <h3 style={{ color: "white" }}>Attended</h3>
                {attendanceList.map((student) => {
                  return (
                    <ListGroup.Item key={student.Name}>
                      <Row>
                        <Col
                          xl={6}
                          lg={6}
                          md={6}
                          sm={6}
                          xs={6}
                          style={{
                            fontWeight: "bold",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            color: "#535353",
                            textAlign: "left",
                          }}
                        >
                          {student.Name}
                        </Col>
                        <Col
                          xl={3}
                          lg={3}
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            fontWeight: "bold",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            color: "#535353",
                            textAlign: "right",
                          }}
                        >
                          {student.Temperature} °C
                        </Col>
                        {editStatus === true && (
                          <Col xl={3} lg={3} md={3} sm={3} xs={3}>
                            <Form.Check
                              type="checkbox"
                              defaultChecked
                              onChange={(e) => {
                                removeStudentHandler(e, student);
                              }}
                            />
                          </Col>
                        )}
                      </Row>
                    </ListGroup.Item>
                  );
                })}
                <h3 style={{ color: "white", marginTop: "5px" }}>Absent</h3>
                {absentList.map((student) => {
                  return (
                    <ListGroup.Item key={student.Name}>
                      <Row>
                        <Col
                          xl={6}
                          lg={6}
                          md={6}
                          sm={6}
                          xs={6}
                          style={{
                            fontWeight: "bold",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            color: "#535353",
                            textAlign: "left",
                          }}
                        >
                          {student.Name}
                        </Col>
                        <Col
                          xl={3}
                          lg={3}
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            fontWeight: "bold",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            color: "#535353",
                            textAlign: "right",
                          }}
                        >
                          {student.ID}
                        </Col>
                        {editStatus === true && (
                          <Col xl={3} lg={3} md={3} sm={3} xs={3}>
                            <Form.Check
                              type="checkbox"
                              onChange={(e) => {
                                addStudentHandler(e, student);
                              }}
                            />
                          </Col>
                        )}
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Col>
        </Row>

        {editStatus === false && (
          <>
            <Row>
              <Col>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "#535353",
                    fontWeight: "bold",
                    marginTop: "10px",
                    borderColor: "#007bff",
                  }}
                  onClick={() => setEditStatus(true)}
                >
                  Edit
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <CsvDownload
                  data={attendanceList}
                  filename={selectedDate + " " + selectedClass + ".csv"}
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "#535353",
                    fontWeight: "bold",
                    marginTop: "10px",
                    borderRadius: "5px",
                    borderColor: "#007bff",
                    padding: ".375rem .75rem",
                  }}
                >
                  Download
                </CsvDownload>
              </Col>
            </Row>
          </>
        )}

        {editStatus === true && (
          <>
            <Row>
              <Col>
                <Button
                  disabled={
                    removeStudents.length === 0 && addStudents.length === 0
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "#535353",
                    fontWeight: "bold",
                    marginTop: "10px",
                    borderColor: "#007bff",
                  }}
                  onClick={() => {
                    setIsSave(true);
                    saveHandler();
                  }}
                >
                  {isSave ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <span>Save</span>
                  )}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "#535353",
                    fontWeight: "bold",
                    marginTop: "10px",
                    borderColor: "#007bff",
                  }}
                  onClick={() => {
                    setAddStudents([]);
                    setRemoveStudents([]);
                    setEditStatus(false);
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default SelectedAttendance;
