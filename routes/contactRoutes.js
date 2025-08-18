import express from "express";

import { addContact } from "../controllers/contactController";

const contactRouter = express.Router();

contactRouter.post("/add", addContact);

export default contactRouter;
