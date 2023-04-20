import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { mongoose } from "@typegoose/typegoose";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { Express } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import i18next from "i18next";

import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import jwt from "jsonwebtoken";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { WebSocketServer } from "ws";
import Context from "./interfaces/context.interface";
import EnvironmentConfig from "./interfaces/environment";
import { resolvers } from "./resolvers";
import { User } from "./schema/user.schema";
import { DataloaderService } from "./services/dataloader.service";
import AuthValidator from "./utils/auth.validator";

dotenv.config();
export const rootPath = __dirname;
i18next
  .use(middleware.LanguageDetector)
  .use(Backend)
  .init({
    backend: {
      loadPath: path.join(__dirname, "/locales/{{lng}}/translation.json"),
    },
    fallbackLng: "en",
    supportedLngs: ["en", "hi"],
    preload: ["en", "hi"],
    load: "languageOnly",
    saveMissing: true,
  });
const bootstrap = async () => {
  mongoose.connect(EnvironmentConfig.MONGODB_URI);
  const app: Express = express();

  app.use(middleware.handle(i18next));
  let schema = await buildSchema({
    resolvers: resolvers,
    validate: false,
    emitSchemaFile: true,
    authChecker: AuthValidator,
  });
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const serverCleanup = useServer({ schema }, wsServer);
  const apolloServer = new ApolloServer<Context>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();
  app.use("/locales", express.static(path.join(__dirname, "locales")));
  app.use("/photos", express.static(path.join(__dirname, "photos")));
  app.post("/locales/add/:lng/:ns", middleware.missingKeyHandler(i18next));

  app.use(cookieParser());
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sandbox.embed.apollographql.com",
      ],
      credentials: true,
    }),
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    json(),
    expressMiddleware(apolloServer, {
      context: async (ctx: Context) => {
        let { req, res } = ctx;
        if (req.cookies?.NEXT_LOCALE) {
          req.i18n.changeLanguage(req.cookies.NEXT_LOCALE);
        } else req.i18n.changeLanguage("en");

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
  httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

bootstrap().catch((err) => console.error(err));
