/**
 * middleware/logger.js
 * Morgan HTTP request logger + Winston structured file logger.
 */

const morgan  = require('morgan');
const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// ─── Ensure logs directory ────────────────────────────────────────────────────
const LOGS_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

// ─── Winston logger ───────────────────────────────────────────────────────────
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // All logs → combined.log
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'combined.log'),
      maxsize:  5 * 1024 * 1024, // 5 MB
      maxFiles: 3,
    }),
    // Error-only → error.log
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'error.log'),
      level:    'error',
      maxsize:  2 * 1024 * 1024,
      maxFiles: 3,
    }),
    // Console — colourised in dev
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message}${
              Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
            }`
        )
      ),
    }),
  ],
});

// ─── Morgan middleware (writes to Winston) ────────────────────────────────────
const morganMiddleware = morgan(
  ':method :url :status :res[content-length]B :response-time ms — :remote-addr',
  {
    stream: {
      write: (msg) => winstonLogger.http(msg.trim()),
    },
  }
);

module.exports = { morganMiddleware, logger: winstonLogger };
