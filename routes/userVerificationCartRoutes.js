import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
// import uploadmiddleware from '../middleware/upload';
import {
    addUserToCart,
    getUserVerificationCartByEmployer,
    getUserVerificationCartByEmployerAll,getPaidUserVerificationCartByEmployer,deleteUser,
    getAllVerifiedCandidateAdmin,
    getAllVerifiedCandidateByCompanyForAdmin,
    getCartDetailsAadhatOTP,
    deleteUserAadharOTP,
    addUserToCartAadharOTP,
    getUserVerificationCartByEmployerFromAdmin,
    listAllTransactionByCompany
} from '../controllers/userVerificationCartController.js'; // Adjust the path according to your project structure

//Middleware
import userAuth from '../middleware/authMiddleware.js';
import Companymid from '../middleware/companyMiddleware.js';
import Adminmid from '../middleware/adminMiddleware.js';


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

userRouter.post('/add_user_cart',  upload.fields([
    { name: 'pandoc', maxCount: 1 },
    { name: 'aadhaardoc', maxCount: 1 },
    { name: 'licensedoc', maxCount: 1 },
    { name: 'doc', maxCount: 1 },
    { name: 'voterdoc', maxCount: 1 },
    { name: 'uandoc', maxCount: 1 }
  ]), userAuth, Companymid, addUserToCart);

userRouter.post('/add_user_cart_aadhao_otp', upload.fields([
    { name: 'aadhaardoc', maxCount: 1 }
  ]), userAuth, Companymid, addUserToCartAadharOTP);

userRouter.post('/deleteUserAadharOTP', upload.none(), userAuth, Companymid, deleteUserAadharOTP);
userRouter.get('/list_user_cart_aadhar_otp', upload.none(), userAuth, Companymid, getCartDetailsAadhatOTP);


userRouter.get('/list_user_cart', upload.none(), userAuth, Companymid, getUserVerificationCartByEmployer);
userRouter.post('/list_user_cart_admin', upload.none(), userAuth, Adminmid, getUserVerificationCartByEmployerFromAdmin);


userRouter.get('/list_user_cart_all', upload.none(), userAuth, Companymid, getUserVerificationCartByEmployerAll);
userRouter.post('/getPaidUserVerificationCartByEmployer', upload.none(), userAuth, Companymid, getPaidUserVerificationCartByEmployer);
userRouter.post('/getAllVerifiedCandidateAdmin', upload.none(), userAuth,Adminmid, getAllVerifiedCandidateAdmin);
userRouter.post('/getAllVerifiedCandidateByCompanyForAdmin', upload.none(), userAuth,Adminmid, getAllVerifiedCandidateByCompanyForAdmin);
userRouter.post('/deleteUser', upload.none(), userAuth, Companymid, deleteUser);

userRouter.post('/list_all_transaction_company', upload.none(), userAuth, Companymid, listAllTransactionByCompany);

export default userRouter;
