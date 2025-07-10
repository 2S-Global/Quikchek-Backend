import express from 'express';

import { getUserVerificationDetails } from '../controllers/userDetailsBySearch.js';

//Middleware
import userAuth from '../middleware/authMiddleware.js';

// Initialize router
const searchDetailsRouter = express.Router();

searchDetailsRouter.get('/getUserDetailsBySearch', userAuth, getUserVerificationDetails);

export default searchDetailsRouter;