import React, { useEffect, useState } from "react";
import { Row, Col, Container, ListGroup, Spinner } from "react-bootstrap";

const StudentList = () => {
  const [studentList, setStudentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
      const response = await fetch("/sheet/student").then((res) => res.json()); // Get Student List
      if (mounted) {
        setStudentList(response);
        setIsLoading(false);
      }
    };
    getData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Container className="text-center studentlist">
        <Row>
          <Col>
            <h3
              style={{
                fontWeight: "bold",
                color: "white",
                textAlign: "left",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              Student List
            </h3>
          </Col>
        </Row>
        <Row>
          <Col>
            {isLoading ? (
              <Spinner animation="border" style={{ color: "white" }} />
            ) : (
              <ListGroup>
                {studentList.map((student) => {
                  return (
                    <ListGroup.Item key={student[1]}>
                      <Row>
                        <Col
                          xl={9}
                          lg={9}
                          md={9}
                          sm={9}
                          xs={9}
                          style={{
                            textAlign: "left",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            fontWeight: "bold",
                            color: "#535353",
                          }}
                        >
                          {student[0]}
                        </Col>
                        <Col
                          xl={3}
                          lg={3}
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            textAlign: "right",
                            fontSize: "calc(0.5rem + 0.6vw)",
                            fontWeight: "bold",
                            color: "#535353",
                          }}
                        >
                          {student[1]}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StudentList;
