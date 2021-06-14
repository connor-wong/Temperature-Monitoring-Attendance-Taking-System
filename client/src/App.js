import React, { useState, useEffect, useContext } from "react";
import { AccountContext } from "./components/Authentication/Account";

import Login from "./components/Authentication/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import AWS from "aws-sdk";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const { getSession } = useContext(AccountContext);

  useEffect(() => {
    getSession().then(() => {
      setTimeout(() => {
        setLoggedIn(true);
      }, 1500);
    });
  }, []);

  AWS.config.update({
    region: "ap-southeast-1",
    accessKeyId: "AKIAVT4QMHKTJR6VFAEN",
    secretAccessKey: "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",
  });

  const dynamodbstreams = new AWS.DynamoDBStreams();

  const getDBStreamRecords = () => {
    const params = {
      ShardIterator:
        "arn:aws:dynamodb:ap-southeast-1:386312977062:table/March/stream/2021-06-13T13:24:55.722|1|AAAAAAAAAAE7FIFVrEzAldfKnuNBQQjHUzWY+O/I9cLr4Qpy23Jh1koVYK/td+Qh9VPsB2D86O78eXsF9VK3o8HB4FH77tXbIUWQrftPG7nJRs2j9FeJJQ6VHgxq/FXDakMNPNadRs61NgYCdrB4iXxj0OD1Yt9pdSlq8unZ9ct+McOo4r1e1wp9NQh9yBX3vEO7V+rf7LGykWC/BpHdC+7A7C0RKdbJZgKSFu0jk6sUPstLon0f6SnU9vfHfbAopkXy+Jar/lhcYkH1n0KbRQPkwpf8ULIqCLsuHTE3gjVuTDZsywma31tAO2TMGlKK3ZmqVkYS4f4ruSJ5++8n4KfnKyhkzDB54iHhHLUFtPtZpRx3W3ipQjhdNX7UTMxglCru8A6qw1kKdqmzGzcI5gaBmxQJwAsxNJ7QN8QM/lAFQ2gnfqesvmu+h5MBoI/FScybA4Jvg8qWv3mq48aC29r5R5nQANcGb/seZaAnZcUbxGDMFgkcmNhLX2Z0LgxG7uv9VqX7TSl/2QPaIqT72z9IB6ka9+8BYo0T9ECKneRtj8+3CVWOMGj9tH3u2EHrYEHgRILqCpJRC77vcjH/BAxvKJlKdO0NVjZVN7xpefrasW6l6vxd40yUy/MfElRid+2acY+sxHaZiVEPurG187tKXelMhW7RT7KZOIWVNsUNzuZhr2XqbImteNC40Fr9AJ42raag1L9n8AAJo96jDhSwJF80WcPPSYrI72CZCs5aykNMrPvFiA==",
    };

    dynamodbstreams.getRecords(params, (err, data) => {
      if (data) console.log(data, data.stack);
      else console.log(err);
    });
  };

  const getDBStreamARNs = () => {
    const params = {
      TableName: "March",
    };

    dynamodbstreams.listStreams(params, (err, data) => {
      if (data) console.log(data, data.stack);
      else console.log(err);
    });
  };

  // Expire every 15 minutes
  const getDBStreamShardIterator = () => {
    const params = {
      ShardId: "shardId-00000001623590696074-6206a3f3",
      ShardIteratorType: "LATEST",
      StreamArn:
        "arn:aws:dynamodb:ap-southeast-1:386312977062:table/March/stream/2021-06-13T13:24:55.722",
    };

    const shard = dynamodbstreams.getShardIterator(params, (data, err) => {
      if (data) {
        //console.log(data, data.stack);
      } //else console.log(err);
    });

    return shard.response;
  };

  //var shard = getDBStreamShardIterator();

  //console.log(JSON.parse(shard[0]));

  return <>{loggedIn ? <Dashboard /> : <Login />}</>;
};

export default App;
