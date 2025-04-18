import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import { getTotal,getMonthlyUserVerifications,getMonthlyUsers,getTotalFrontend,getMonthlyUserVerificationsFrontend} from '../controllers/dashboardController.js';

//Middleware
import userAuth from '../middleware/authMiddleware.js';
import Companymid from '../middleware/companyMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

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


userRouter.get("/getTotal",userAuth,adminMiddleware,getTotal);
userRouter.get("/getMonthlyUserVerifications",getMonthlyUserVerifications);
userRouter.get("/getMonthlyUsers",getMonthlyUsers);
userRouter.post("/getTotalFrontend",userAuth,Companymid,getTotalFrontend);
userRouter.post("/getMonthlyUserVerificationsFrontend",userAuth,Companymid,getMonthlyUserVerificationsFrontend);
// userRouter.get("/getTotal",getTotal);


export default userRouter;
