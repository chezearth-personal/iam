import Winston, { createLogger, format, transports } from 'winston';
import morgan from 'morgan';

morgan.token('message', (req, res) => res.statusMessage || '');
const getIPFormat = () => process.env.NODE_ENV === 'production' ? ':remote-addr - ' : '';
const successResponseFormat = `${getIPFormat()}:method :url HTTP/:http-version :status :res[content-length] - :response-time ms`;
const errorResponseFormat = `${getIPFormat()}:method :url HTTP/:http-version :status :res[content-length] - :response-time ms - message: :message`;

/** Define the levels and their corresponding colors that appear in the logs */
const levels = {
  levels: {
    FATAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    HTTP: 4,
    DEBUG: 5,
    TRACE: 6
  },
  colors: {
    FATAL: 'bold italic red cyanBG',
    ERROR: 'bold italic red',
    WARN: 'bold yellow',
    INFO: 'cyan',
    HTTP: 'blue',
    DEBUG: 'black',
    TRACE: 'green'
  }
}

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

Winston.addColors(levels.colors);

export const logger = createLogger({
  levels: levels.levels,
  level: process.env.NODE_ENV === 'development' ? 'TRACE' : 'HTTP',
  format: format.combine(
    enumerateErrorFormat(),
    format.timestamp(),
    process.env.NODE_ENV === 'development'
      ? format.colorize()
      : format.uncolorize(),
    format.splat(),
    format.printf(({ level, timestamp, message }) => `[${level}] ${
      (`${level}`).length - 20 === 4 ? ' ' : ''
    }${timestamp} ${message}`)
  ),
  transports: [ new transports.Console() ]
});

export const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.log('HTTP', message.trim()) }
})
export const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.log('ERROR', message.trim()) }
});
