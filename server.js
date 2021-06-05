// server/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const { google } = require("googleapis");
const AWS = require("aws-sdk");
require("dotenv").config();

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
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "March";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Variables
var sheetId = "";
var userEmail = "";
var classTitle = "";

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

// Handle POST requests
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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  // Express serve up index.html file if it doesn't recognize route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Listen
app.listen(PORT, () => {
  console.log(`Server up ${PORT}!`);
});
