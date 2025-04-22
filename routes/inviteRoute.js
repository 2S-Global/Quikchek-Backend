import express from "express";
import { inviteController } from "../controllers/inviteController.js";
import multer from "multer";

const InviteRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

InviteRouter.post("/invite", upload.none(), inviteController);

export default InviteRouter;
