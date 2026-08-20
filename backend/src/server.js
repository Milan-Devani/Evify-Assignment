const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before any other module
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const { errorHandler, AppError } = require('./middleware');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down... ${err.name}: ${err.message}`, {
    stack: err.stack,
  });
  process.exit(1);
});

// Initialize Express App
const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. HTTP Request Logging (Morgan stream -> Winston)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    skip: () => process.env.NODE_ENV === 'test',
  })
);

// 5. Root Info Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Evify Fleet Management API',
    version: '1.0.0',
    description: 'RESTful API for EV Fleet and Vehicle Management',
    endpoints: {
      health: '/health',
      auth: '/api/auth/login',
      vehicles: '/api/vehicles',
      fleets: '/api/fleets',
    },
  });
});

// 6. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
  });
});

// 7. Mount API Routes
app.use('/api', apiRoutes);

// 8. 404 Handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.method} ${req.originalUrl} on this server!`, 404));
});

// 9. Global Error Handling Middleware (Last middleware)
app.use(errorHandler);

// Start server if run directly (not required by test suite)
let server;
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION! Shutting down... ${err.name}: ${err.message}`, {
    stack: err.stack,
  });
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Export app and server for testing
module.exports = app;
