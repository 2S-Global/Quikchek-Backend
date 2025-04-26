import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {listUserVerifiedList,verifyPAN,verifyEPIC,cloneAndMoveRecordById,verifyAadhaar,verifyPassport,verifyDL,searchUserVerifiedList,verifiedDetails,paynow, verifyDataBackground ,verifyUan,verifyEpfo,aadharWithOtp,verifyOtp} from '../controllers/userVerificationController.js';

//Middleware
import userAuth from '../middleware/authMiddleware.js';
import Companymid from '../middleware/companyMiddleware.js';


// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// userRouter.post('/list_verified_users', upload.none(), userAuth, Companymid, listUserVerifiedList);

userRouter.get("/listUserVerifiedList",upload.none(), userAuth, Companymid, listUserVerifiedList);
userRouter.post("/verifyPAN",upload.none(), userAuth, Companymid, verifyPAN);
userRouter.post("/verifyEPIC",upload.none(), userAuth, Companymid, verifyEPIC);
userRouter.post("/cloneAndMoveRecordById",upload.none(), userAuth, Companymid, cloneAndMoveRecordById);
userRouter.post("/verifyAadhaar",upload.none(), userAuth, Companymid, verifyAadhaar);
userRouter.post("/verifyPassport",upload.none(), userAuth, Companymid, verifyPassport);
userRouter.post("/verifyDL",upload.none(), userAuth, Companymid, verifyDL);
userRouter.post("/searchUserVerifiedList",upload.none(), userAuth, Companymid, searchUserVerifiedList);
userRouter.post("/verifiedDetails",upload.none(),verifiedDetails);
userRouter.post("/paynow",upload.none(),userAuth, Companymid,paynow);
userRouter.get("/verifyDataBackground",verifyDataBackground);
userRouter.post("/verifyUan",verifyUan);
userRouter.post("/verifyEpfo",verifyEpfo);
// userRouter.post("/aadharWithOtp",aadharWithOtp);
// userRouter.post("/verifyOtp",verifyOtp);

export default userRouter;
