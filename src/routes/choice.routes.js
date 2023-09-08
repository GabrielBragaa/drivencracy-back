import { Router } from "express";
import { getChoices, sendChoice, voteChoice } from "../controllers/choice.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middlewares.js";
import { choiceSchema } from "../schemas/choice.schemas.js";

const choiceRouter = Router();

choiceRouter.post("/choice", validateSchema(choiceSchema), sendChoice);
choiceRouter.get("/poll/:id/choice", getChoices);
choiceRouter.post("/choice/:id/vote", voteChoice);

export default choiceRouter;