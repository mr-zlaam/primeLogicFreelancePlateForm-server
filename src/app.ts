import express, { type Express } from "express";

import cors from "cors";
import path from "node:path";
import { authRouter } from "./routers/authRouter/authRouter";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { AUTHROUTE, HEALTHROUTE } from "./constants";
import { healthRouter } from "./routers/healthRouter/healthRouter";
import helmet from "helmet";
// **** APP *****
const app: Express = express();
// ** MIDDLEWARES **
app.use(helmet())
app.use(express.json());
app.use(express.static(path.join(__dirname, "../", "public")));
app.use(cors());
// **APPLICATION ROUTES **
app.use(AUTHROUTE, authRouter);
// ** Health route
app.use(HEALTHROUTE, healthRouter);
// **** ERROR HANDLERS ****
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
