import serverless from "serverless-http";
import app from "../artifacts/api-server/src/app";

export const config = {
  maxDuration: 30,
};

export default serverless(app);
