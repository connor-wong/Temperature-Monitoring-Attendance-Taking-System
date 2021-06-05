import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-southeast-1_LW7VL5TAI",
  ClientId: "n4hbcid1kla9n4mktonhu7fmk",
};

export default new CognitoUserPool(poolData);
