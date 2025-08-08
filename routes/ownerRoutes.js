import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// import {
//     addTransaction,getUserTransactions,walletBalance 
// } from '../controllers/walletController.js';

import { testController, registerOwnerUser, listOwners, editOwners, deleteOwners, importOwnerCsv } from '../controllers/ownerController.js';

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
const ownerRouter = express.Router();

// Setup multer with memory storage for handling file uploads

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// Multer storage config
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });


// userRouter.post('/addTransaction', upload.none(), userAuth, Companymid, addTransaction);
// userRouter.get('/getUserTransactions',upload.none(),userAuth,Companymid,getUserTransactions);
// userRouter.post('/walletBalance', userAuth, Companymid, walletBalance);

ownerRouter.get('/getData',upload.none(),userAuth,Companymid,testController);
// ownerRouter.post('/register_owner', upload.none(), userAuth, adminMiddleware, registerOwnerUser);
ownerRouter.post('/register_owner', upload.none(), userAuth, registerOwnerUser);
ownerRouter.post('/list_owner',upload.none(),userAuth, listOwners);
ownerRouter.post('/edit_owner',upload.none(),userAuth, editOwners);
ownerRouter.post('/delete_owner',upload.none(),userAuth, deleteOwners);
ownerRouter.post('/import_owner_csv',upload.single("file"),userAuth, importOwnerCsv);

export default ownerRouter;