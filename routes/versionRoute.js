import express from "express";

import { versionController } from "../controllers/versionController.js";

const versionRouter = express.Router();

versionRouter.post("/", versionController);

export default versionRouter;
