import express from "express";

import { preparedb, sendEmail } from "../controllers/emailController.js";

const email_router = express.Router();

email_router.get("/preparedb", preparedb);
email_router.get("/sendemail", sendEmail);

export default email_router;
