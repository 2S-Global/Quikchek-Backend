import express from "express";
import multer from "multer";

import userAuth from "../middleware/authMiddleware.js";
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import {
  addMarquee,
  editMarquee,
  deleteMarquee,
  toggleMarqueeStatus,
  All_listMarquee,
  listMarquee,
} from "../controllers/MarqueeController.js";

const MarqueeRouter = express.Router();

/*/add_marquee
/edit_marquee
/delete_marquee
/toggle_marquee_status
/list_marquee //for all
/all_list_marquee//for admin
  */
MarqueeRouter.post(
  "/add_marquee",
  upload.single("image"),
  userAuth,
  addMarquee
);

MarqueeRouter.put(
  "/edit_marquee",
  upload.single("image"),
  userAuth,
  editMarquee
);

MarqueeRouter.delete("/delete_marquee", userAuth, upload.none(), deleteMarquee);

MarqueeRouter.put(
  "/toggle_marquee_status",
  userAuth,
  upload.none(),
  toggleMarqueeStatus
);

MarqueeRouter.get("/list_marquee", listMarquee);
MarqueeRouter.get("/all_list_marquee", userAuth, All_listMarquee);

export default MarqueeRouter;
