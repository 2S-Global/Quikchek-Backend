import express from "express";

import {
  getallownerforcompany,
  getreports,
  reportPDF,
} from "../controllers/complexController.js";
//Middleware
import userAuth from "../middleware/authMiddleware.js";
import Companymid from "../middleware/companyMiddleware.js";
import Adminmid from "../middleware/adminMiddleware.js";

// Initialize router
const ComplexRouter = express.Router();

ComplexRouter.get(
  "/getallownerforcompany",
  userAuth,
  Companymid,
  getallownerforcompany
);

ComplexRouter.get("/getreports", userAuth, Companymid, getreports);

ComplexRouter.post("/reportPDF", userAuth, Companymid, reportPDF);

export default ComplexRouter;
