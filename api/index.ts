import serverless from "serverless-http";
import app from "../artifacts/api-server/dist/serverless.mjs";

export const config = {
  maxDuration: 30,
};

export default serverless(app);
