import 'dotenv/config';

import 'reflect-metadata';
import { PubSub } from 'graphql-subscriptions';
import { ApolloServer } from 'apollo-server';
import { v1 as neo4j } from 'neo4j-driver';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';
// import { createServer } from 'http';

export const pubsub = new PubSub();

const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
});

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
);

const startServer = async () => {
  const apollo = new ApolloServer({
    context: { driver },
    schema,
  });
  apollo.listen(process.env.GRAPHQL_LISTEN_PORT, '0.0.0.0').then(({ url }) => {
    console.log(`GraphQL API ready at ${url}`);
    // const server = createServer();
    // apollo.installSubscriptionHandlers(server);
    // server.listen(5001, '0.0.0.0', () => {
    //   console.log(`🚀 Subscriptions Server Ready at http://localhost:5001`);
    // });
  });
};

startServer().catch(console.log);
