import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { expressMiddleware } from "@apollo/server/express4";
import { mongoose } from "@typegoose/typegoose";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { Express } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import jwt from "jsonwebtoken";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import Context from "./interfaces/context.interface";
import EnvironmentConfig from "./interfaces/environment";
import { resolvers } from "./resolvers";
import { User } from "./schema/user.schema";
import { DataloaderService } from "./services/dataloader.service";
import AuthValidator from "./utils/auth.validator";
dotenv.config();
export const rootPath = __dirname;

const bootstrap = async () => {
  mongoose.connect(EnvironmentConfig.MONGODB_URI);
  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
      emitSchemaFile: true,
      authChecker: AuthValidator,
    }),

    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          "request.credentials": "include",
          "editor.reuseHeaders": false,
        },
      }),
    ],
  });
  await apolloServer.start();
  const app: Express = express();
  app.use("/photos", express.static(path.join(__dirname, "photos")));
  app.use(cookieParser());
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: "http://localhost:3000",
      credentials: true,
    }),
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    json(),
    expressMiddleware(apolloServer, {
      context: async (ctx: Context) => {
        let { req, res } = ctx;
        if (req.cookies?.accessToken) {
          let token = req.cookies?.accessToken;
          try {
            const decoded = jwt.verify(
              token,
              EnvironmentConfig.JWT_SECRET
            ) as User;
            if (decoded) ctx.user = decoded;
          } catch {}
        }
        ctx.loaders = new DataloaderService().getLoaders();
        return ctx;
      },
    })
  );

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

bootstrap().catch((err) => console.error(err));
