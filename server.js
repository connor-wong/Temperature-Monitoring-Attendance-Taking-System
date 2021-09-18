// server
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { google } = require("googleapis");
const AWS = require("aws-sdk");
const webpush = require("web-push");
const cron = require("node-cron");
require("dotenv").config();

const PORT = process.env.PORT || 8000; // default port to listen

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "client", "build")));

// Variables
var sheetId = "";
var userEmail = "";
var classTitle = "";
var classArray = [];
var subscription = "";
var describeData = "";
var shardIterObj = "";
var setHours = 8;

// Web Push Configuration
webpush.setVapidDetails(
  "mailto: ", //CHANGE
  process.env.PUBLIC_VAPID_KEY, //CHANGE
  process.env.PRIVATE_VAPID_KEY //CHANGE
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
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// DynamoDB
const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Attendance";
const ARN = process.env.AWS_DYNAMODB_ARN;

// DynamoDB Stream
const dynamodbstreams = new AWS.DynamoDBStreams();

const describeStream = () => {
  const params = {
    StreamArn: ARN,
  };

  return new Promise((resolve, reject) => {
    dynamodbstreams.describeStream(params, function (err, data) {
      if (err) reject(err);
      // an error occurred
      else resolve(data);
    });
  });
};

const getDBStreamRecords = (params) => {
  return new Promise((resolve, reject) => {
    dynamodbstreams.getRecords(params, function (err, data) {
      if (err) reject(err, err.stack);
      else resolve(data);
    });
  });
};

const getDBStreamShardIterator = (latestShard) => {
  const params = {
    ShardId: latestShard,
    ShardIteratorType: "LATEST",
    StreamArn: ARN,
  };

  return new Promise((resolve, reject) => {
    dynamodbstreams.getShardIterator(params, function (err, data) {
      if (err) reject(err);
      // an error occurred
      else resolve(data);
    });
  });
};

// const getDBStreamARNs = () => {
//   const params = {
//     TableName: TABLE_NAME,
//   };

//   return new Promise((resolve, reject) => {
//     dynamodbstreams.listStreams(params, function (err, data) {
//       if (err) reject(err, err.stack);
//       else resolve(data);
//     });
//   });
// };

// Cron Schdules
// Create New ShardIterator Between 8am - 5pm
cron.schedule(`0 ${setHours} * * 1,2,3,4,5`, async () => {
  describeData = await describeStream();

  let latestShard =
    describeData.StreamDescription.Shards[
      describeData.StreamDescription.Shards.length - 1
    ];

  shardIterObj = await getDBStreamShardIterator(latestShard.ShardId);

  if (setHours > 17) {
    setHours = 8;
  } else {
    setHours = setHours + 1;
  }
});

// Check for high temperature 14 minutes after the shard iterator creation
cron.schedule(`14 ${setHours} * * 1,2,3,4,5`, async () => {
  let data = await getDBStreamRecords(shardIterObj);
  let records = data.Records;
  let notificationContent = [];

  //Filter INSERT Event & High Temperature Only
  let highTempList = records.filter(
    (record) =>
      record.eventName === "INSERT" &&
      JSON.parse(Object.values(record.dynamodb.NewImage.Temperature)) > 37.4 &&
      classArray.includes(Object.values(record.dynamodb.NewImage.Class).join())
  );

  if (highTempList) {
    highTempList.forEach((record) => {
      let student = Object.values(record.dynamodb.NewImage);
      notificationContent.push({
        Class: Object.values(student[0]).join(),
        Date: Object.values(student[1]).join(),
        Name: Object.values(student[2]).join(),
        id: Object.values(student[3]).join(),
        Temperature: Object.values(student[4]).join(),
      });
    });

    notificationContent.forEach((student) => {
      const payload = JSON.stringify({
        title: "Student High Temperature Alert!",
        body:
          student.Class +
          " " +
          student.Name +
          " " +
          student.id +
          " " +
          student.Temperature +
          "°C",
      });

      webpush
        .sendNotification(subscription, payload)
        .then((result) => console.log(result))
        .catch((e) => console.log(e.stack));
    });
  }
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

// Handle POST requests
app.post("/sheet/class", async (req, res) => {
  try {
    const data = await Object.keys(req.body);
    classTitle = data[0];

    if (!classArray.includes(classTitle)) {
      classArray.push(classTitle);
    }

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
  console.log(subscription);
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
