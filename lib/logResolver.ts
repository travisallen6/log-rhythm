
import Logger from './logger'

interface IResolver {
  [key: string]: (parent: any, args: { [key: string]: any }, context: any, info: any) => any
}

interface IResolverConfig {
  Query?: IResolver;
  Mutation?: IResolver;
  [key: string]: IResolver;
}

export default function logResolver(resolverConfig: IResolverConfig) {
  return Object.entries(resolverConfig).reduce((finalResolverConfig, [queryType, resolvers]) => {
    finalResolverConfig[queryType] = Object.entries(resolvers).reduce((finalResolvers, [resolverName, resolverFunction]) => {
      finalResolvers[resolverName] = (parent: any, args: any, context: { logger: Logger }, info: any) => {
        context.logger.resolver(queryType, resolverName);
        resolverFunction(parent, args, context, info)
      }
      return finalResolvers;
    }, {})
    return finalResolverConfig;
  }, {}) as IResolverConfig;
}