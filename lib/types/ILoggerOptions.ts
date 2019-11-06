import * as Transport from 'winston-transport'
import logLevels from './logLevels'

export default interface ILoggerOptions {
  transports: Transport[];
  logResolvers?: boolean;
  logResolversLogLevel?: logLevels;
}
