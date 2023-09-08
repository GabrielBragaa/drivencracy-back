import { Router } from "express";
import pollRouter from "./poll.routes.js";
import choiceRouter from "./choice.routes.js";

const indexRouter = Router();

indexRouter.use(pollRouter);
indexRouter.use(choiceRouter);

export default indexRouter;

