import winston from 'winston';
import config from '../config/environment';

/**
 * Logger configurado con Winston
 * Proporciona logging estructurado para toda la aplicación
 */
const logger = winston.createLogger({
  level: config.logging,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'travel-ai-agent' },
  transports: [
    // Escribir logs a archivos
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// En desarrollo, también log a consola con formato legible
if (config.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
