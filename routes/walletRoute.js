import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    addTransaction,getUserTransactions,walletBalance 
} from '../controllers/walletController.js'; // Adjust the path according to your project structure

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

userRouter.post('/addTransaction', upload.none(), userAuth, Companymid, addTransaction);
userRouter.get('/getUserTransactions',userAuth,Companymid,getUserTransactions);
userRouter.post('/walletBalance',userAuth,Companymid,walletBalance);


export default userRouter;
