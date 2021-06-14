// server/index.js
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { google } = require("googleapis");
const AWS = require("aws-sdk");
require("dotenv").config();
const bodyParser = require("body-parser");
const webpush = require("web-push");
const cron = require("node-cron");

const PORT = process.env.PORT || 8000; // default port to listen

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "client", "build")));

// Web Push Configuration
webpush.setVapidDetails(
  "mailto: s10197876@connect.np.edu.sg",
  "BDwtsxZpmUHSnFq5VViqOGkrcZLO2HxeSZPdVyA3upYBhVghSJMNkiZX5KFX5KnrheGyLCAX8-Lh1OtLaEGWNbI",
  "dRog_7D0fmi-fMHyT9hqFQ81VZbj_PCQr7P3n0St5DY"
);

// Google Configuration
const auth = new google.auth.GoogleAuth({
  keyFile: "token.json",
  scopes:
    "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly",
});

const client = auth.getClient();
const drive = google.drive({ version: "v3", client });
const googleSheets = google.sheets({ version: "v4", auth: client });

// AWS Configuration
AWS.config.update({
  region: "ap-southeast-1",
  accessKeyId: "AKIAVT4QMHKTJR6VFAEN",
  secretAccessKey: "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",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "March";

// Variables
var sheetId = "";
var userEmail = "";
var classTitle = "";
var subscription = "";

// Cron Job
cron.schedule("* * * * 1,2,3,4,5", () => {
  const payload = JSON.stringify({
    title: "Student High Temperature Alert!",
    body: "It works.",
  });

  webpush
    .sendNotification(subscription, payload)
    .then((result) => console.log(result))
    .catch((e) => console.log(e.stack));
});

// Handle GET requests
// Classes.js Component
app.get("/drive/api", async (req, res) => {
  try {
    // Google Drive Data
    const metaData = await drive.files.list({
      auth,
      q: "name = " + "'" + userEmail + "'",
    });

    sheetId = metaData.data.files[0].id;
    res.send(metaData.data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/sheet/api", async (req, res) => {
  try {
    // Google Sheet Data
    const spreadsheetId = sheetId;

    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    res.send(metaData.data);
  } catch (error) {
    console.log(error);
  }
});

// Latest Attendance
app.get("/sheet/student", async (req, res) => {
  try {
    // Google Sheet Data
    const spreadsheetId = sheetId;
    const getStudents = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: classTitle + "!A2:B",
    });

    res.send(getStudents.data.values);
  } catch (error) {
    console.log(error);
  }
});

app.get("/aws/api", async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "Class_Index",
      KeyConditionExpression: "#class = :class",
      ExpressionAttributeNames: {
        "#class": "Class",
      },
      ExpressionAttributeValues: {
        ":class": classTitle,
      },
      ScanIndexForward: false,
    };

    const data = await dynamodbClient.query(params).promise();
    res.send(data.Items);
  } catch (error) {
    console.log(error);
  }
});

app.get("/notifications/push", (req, res) => {
  const payload = JSON.stringify({
    title: "Student High Temperature Alert!",
    body: "It works.",
  });

  webpush
    .sendNotification(subscription, payload)
    .then((result) => console.log(result))
    .catch((e) => console.log(e.stack));
});

// Handle POST requests
app.post("/sheet/class", async (req, res) => {
  try {
    const data = await Object.keys(req.body);
    classTitle = data[0];
    req.setTimeout(0);
    res.send(classTitle);
  } catch (error) {
    console.log(error);
  }
});

app.post("/drive/email", async (req, res) => {
  try {
    const data = await Object.keys(req.body);
    userEmail = data[0];
    req.setTimeout(0);
    res.send(userEmail);
  } catch (error) {
    console.log(error);
  }
});

app.post("/notifications/subscribe", (req, res) => {
  subscription = req.body;

  res.status(200).json({ success: true });
});

app.get("/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "service-worker.js"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Listen
app.listen(PORT, () => {
  console.log(`Server up ${PORT}!`);
});
