import express from "express";

import {
  getallownerforcompany,
  getreports,
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

export default ComplexRouter;
