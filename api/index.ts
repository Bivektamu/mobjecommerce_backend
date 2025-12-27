import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import {graphqlUploadExpress} from "graphql-upload-ts";
import cors from 'cors'
import {Request, Response} from 'express'
import http from 'http';


import resolvers from '../gqlSchema/resolvers/index.resolver';

import connectDB from '../dataLayer';
import typeDefs from '../gqlSchema/typeDefs/index.typeDef'
import {MyContext } from '../types';
import { getAuth } from '../middleware/auth.middleware';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cookieParser())

app.use(express.static('public'))
app.use(graphqlUploadExpress({
  overrideSendResponse: false 
}));

const httpServer = http.createServer(app);

interface Context {
  req:Request,
  res:Response
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true,
});

async function startServer() {
  await connectDB()

  await server.start();

  app.use('/graphql',
    cors<cors.CorsRequest>(
      {
        origin:['http://localhost:5173', 'https://mobjecommerce.netlify.app']
      }
    ),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ 
        req, 
        res,
        auth: getAuth(req)
       }),
    }));

    await new Promise<void>((resolve) => httpServer.listen({ port: 3000 }, resolve));
    console.log(`🚀 Server is ready.`);

}

startServer()