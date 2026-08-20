const serverless = require('serverless-http');
const app = require('./server');
const connectDB = require('./config/db');

let isConnected = false;

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  const slsHandler = serverless(app);
  return slsHandler(event, context);
};

module.exports.handler = handler;
