import express, { type Express } from "express";

import cors from "cors";
import path from "node:path";
import { authRouter } from "./routers/authRouter/authRouter";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import {
  AUTHROUTE,
  CONTACTUSROUTE,
  HEALTHROUTE,
  NAVIGATIONPAGESROUTE,
  NEWSLETTERROUTE,
  TRASHROUTE,
  GETQUOTESROUTE,
  CONSULTATIONROUTE,
  HIREUSROUTE
} from "./constants/index";
import { healthRouter } from "./routers/healthRouter/healthRouter";
import helmet from "helmet";
import { contactUsRouter } from "./routers/contactUsRouter/contactUsRouter";
import { newsLetterRouter } from "./routers/newsLetterRouter/newsLetterRouter";
import { trashRouter } from "./routers/trashRouter/trashRouter";
import { navigationPagesRouter } from "./routers/navigationPagesRouter/navigationPagesRouter";
import { getQuoteRouter } from "./routers/getQuoteRouter/getQuoteRouter";
import { consultationRouter } from "./routers/consultationRouter/consultationRouter";
import { hireUsRouter } from "./routers/hireUsRouter/hireUsRouter";
// **** APP *****
const app: Express = express();
// ** MIDDLEWARES **

app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    credentials: true,
    origin: "*" //TODO: change this in production
  })
);
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../public")));
// **APPLICATION ROUTES **
app.use(AUTHROUTE, authRouter);
// ** Health route
app.use(HEALTHROUTE, healthRouter);
// ** Contact Us Route
app.use(CONTACTUSROUTE, contactUsRouter);
// ** Newsletter Router
app.use(NEWSLETTERROUTE, newsLetterRouter);
// **  Trash Router
app.use(TRASHROUTE, trashRouter);
// ** Navigation Pages Router
app.use(NAVIGATIONPAGESROUTE, navigationPagesRouter);
// ** Get Quotes Router
app.use(GETQUOTESROUTE, getQuoteRouter);
// ** Consultation Router
app.use(CONSULTATIONROUTE, consultationRouter);
// **   HIRE US ROUTER
app.use(HIREUSROUTE, hireUsRouter);
// **** ERROR HANDLERS ****
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
