import express from 'express';
import { getPrivacyPolicy } from '../controllers/privacyPolicyController.js';

const userRouter = express.Router();

// Route to get the privacy policy
userRouter.get("/getPrivacyPolicy", getPrivacyPolicy);

export default userRouter;
