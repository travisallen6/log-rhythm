const autoBind = require('auto-bind');
import { ILoggerOptions, logLevels } from './types'
import * as winston from 'winston'

interface KeyValues {
  [key: string]: any;
}

export default class Logger {
  private meta: KeyValues = {};
  private logger: winston.Logger;
  private logResolvers: boolean;
  private logResolversLevel: logLevels;

  constructor(loggerOptions: ILoggerOptions) {
    autoBind(this);
    const logger = winston.createLogger();
    loggerOptions.transports.forEach(transport => logger.add(transport))
    this.logger = logger;
    this.logResolvers = loggerOptions.logResolvers || true;
    this.logResolversLevel = loggerOptions.logResolversLogLevel || logLevels.info;
  }

  private logKeyValuePairs(keyValues: KeyValues, logFunction: winston.LeveledLogMethod) {
    if (typeof keyValues !== 'object') logFunction(keyValues)
    Object.entries(keyValues).forEach(([key, val]) => {
      logFunction(`${key}: ${val}`, { metadata: this.meta })
    })
  }

  userId(userId: string) {
    this.meta.userId = userId;
  }

  resolver(resolverType: string, resolverName: string) {
    this.meta.resolverType = resolverType
    this.meta.resolverName = resolverName;
    if (this.logResolvers) {
      this.logger[this.logResolversLevel](`RESOLVER: ${resolverType}-${resolverName}`)
    }
  }

  method(methodName: string) {
    this.meta.method = methodName;
  }

  redact(keyValues: KeyValues) {
    const redacted: KeyValues = {}
    Object.entries(keyValues).forEach(([key, val]) => {
      if (val === undefined || val === null || val === NaN || val === false || val === true) {
        redacted[key] = `${val}`
      } else {
        redacted[key] = val
          .toString()
          .replace(/[a-z]/g, 'a')
          .replace(/[A-Z]/g, 'A')
          .replace(/\d/g, '1')
          .replace(/[^a-zA-Z\d]/g, '!')
      }
    })
    return {
      error: () => {
        return this.error(redacted)
      },
      warn: () => {
        return this.warn(redacted)
      },
      info: () => {
        return this.info(redacted)
      },
      verbose: () => {
        return this.verbose(redacted)
      },
      debug: () => {
        return this.debug(redacted)
      },
      silly: () => {
        return this.silly(redacted)
      },
    };
  }

  error(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.error);
  }

  warn(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.warn);
  }

  info(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.info);
  }

  verbose(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.verbose);
  }

  debug(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.debug);
  }

  silly(keyValues: KeyValues) {
    this.logKeyValuePairs(keyValues, this.logger.silly);
  }
}