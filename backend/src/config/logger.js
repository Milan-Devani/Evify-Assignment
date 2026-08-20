const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists in non-test environments
const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory) && process.env.NODE_ENV !== 'test') {
  try {
    fs.mkdirSync(logDirectory, { recursive: true });
  } catch (err) {
    // Ignore error if cannot create
  }
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'development') return 'debug';
  if (env === 'test') return 'error';
  return 'info';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(colors);

// Development Format: Colorized, human-readable
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Production Format: Structured JSON with timestamp and errors
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

// Always add console transport
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    silent: process.env.NODE_ENV === 'test' && process.env.TEST_LOGGING !== 'true',
  })
);

// Add file transports only in production/development (skip in unit test runs)
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

module.exports = logger;
