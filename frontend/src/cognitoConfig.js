// cognitoConfig.js
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "eu-central-1_QqD0UPSt2",     // Your AWS Cognito User Pool ID
  ClientId: "6rp3kfegbtggpp1s9nt81ib0ol",   // Your App Client ID (without secret)
};

export const userPool = new CognitoUserPool(poolData);
