import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Container } from "react-bootstrap";

import NavBar from "./NavBar";
import LatestAttendance from "./LatestAttendance/LatestAttendance";
import StudentMatters from "./StudentMatters/StudentMatters";
import Classes from "./Classes/Classes";

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [temperatureMatter, setTemperatureMatter] = useState([]);
  const [lowAttendanceMatter, setlowAttendanceMatter] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState(true);

  useEffect(() => {
    if (updateData) {
      getData();
      fetch("/notifications/push");
    }
  }, [updateData]);

  const getData = async () => {
    let classes = [];
    let classArray = [];
    let studentArray = [];
    let dataArray = [];
    let dateArray = [];
    let attendance = [];
    let temperatureMatter = [];
    let lowAttendanceMatter = [];
    let absentArray = [];

    await fetch("/drive/api");

    await fetch("/sheet/api")
      .then((res) => res.json())
      .then((res) => {
        classes = res.sheets;
        res.sheets.forEach((result) => {
          classArray.push(result.properties.title);
        });
      });

    for (const classTitle of classArray) {
      let studentList = [];
      await axios.post("/sheet/class", classTitle);

      await fetch("/sheet/student") // Get Student List
        .then((res) => res.json())
        .then((res) => {
          studentArray = res;
        });

      await fetch("/aws/api") // Get Student Attendance
        .then((res) => res.json())
        .then((res) => {
          dataArray = res;
        });

      // Sort to latest date
      dataArray.sort((a, b) => {
        return new Date(b.Date) - new Date(a.Date);
      });

      // Data formation
      const latestAttendanceData = dataArray.filter((res) =>
        res.Date.includes(dataArray[0].Date.split(" ")[0])
      );

      if (dataArray.length < 1 || dataArray === undefined) {
        // do nothing
      } else {
        const date = dataArray[0].Date.split(" ")[0];
        const totalStudents = studentArray.length;
        let presentCount = 0;

        studentArray.forEach((res) => {
          latestAttendanceData.forEach((student) => {
            if (res[0].includes(student.Name)) {
              presentCount = presentCount + 1;
            }
          });
          // Convert array to object
          studentList.push({
            Name: res[0],
            ID: res[1],
            Class: classTitle,
          });
        });

        // Class, Date, Present, Total Students
        attendance.push({
          Class: classTitle,
          Date: date,
          Present: presentCount,
          Total_Students: totalStudents,
        });

        // Student Matters (High Temperature)
        latestAttendanceData.forEach((student) => {
          if (student.Temperature >= 37.5) {
            temperatureMatter.push(student);
          }
        });

        // Student Matters (Low Attendance)
        dataArray.forEach((data) => {
          dateArray.push(data.Date.split(" ")[0]);
        });

        dateArray = [...new Set(dateArray)]; // Remove Duplicates

        dateArray.forEach((date) => {
          let attendance = [];
          let absentList = [];

          attendance = dataArray.filter((res) => res.Date.includes(date));

          if (attendance.length !== 0) {
            absentList = studentList.filter(
              ({ Name: id1 }) =>
                !attendance.some(({ Name: id2 }) => id2 === id1)
            );
            absentArray = [...absentArray, ...absentList];
          }
        });

        let absentChecker = [];
        absentChecker = absentArray.filter((res) =>
          res.Class.includes(classTitle)
        );

        lowAttendanceMatter = [
          ...lowAttendanceMatter,
          ...absentChecker.reduce(function (acc, el, i, arr) {
            if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
            return acc;
          }, []),
        ];
      }
    }

    setClasses(classes); // Class Component
    setAttendance(attendance); // LatestAttendance Component
    setTemperatureMatter(temperatureMatter); // Student Matter Component
    setlowAttendanceMatter(lowAttendanceMatter); // Student Matter Component
    setIsLoading(false);
    setUpdateData(false);
  };

  return (
    <>
      <NavBar />
      <Container className="text-center dashboard" fluid>
        <Row>
          <Col>
            <h3
              style={{
                fontSize: "calc(22px + 2vw)",
                fontWeight: "bold",
                color: "#535353",
                textAlign: "left",
              }}
            >
              Your Dashboard
            </h3>
          </Col>
        </Row>

        <Row>
          <Col xl={6} lg={12} md={12} sm={12} xs={12}>
            <Row style={{ marginBottom: "10px" }}>
              <Col xl={12} lg={12} md={12} sm={12} xs={12}>
                <LatestAttendance
                  attendance={attendance}
                  isLoading={isLoading}
                  setUpdateData={setUpdateData}
                />
              </Col>
            </Row>

            <Row style={{ marginBottom: "10px" }}>
              <Col xl={12} lg={12} md={12} sm={12} xs={12}>
                <StudentMatters
                  temperatureMatter={temperatureMatter}
                  lowAttendanceMatter={lowAttendanceMatter}
                  isLoading={isLoading}
                />
              </Col>
            </Row>
          </Col>

          <Col
            xl={6}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            style={{ marginBottom: "10px" }}
          >
            <Classes
              classes={classes}
              isLoading={isLoading}
              setUpdateData={setUpdateData}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
