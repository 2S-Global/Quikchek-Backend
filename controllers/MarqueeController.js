import Marquee from "../models/MarqueeModel.js";

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//add marquee
export const addMarquee = async (req, res) => {
  try {
    const title = req.body.title;
    const sort = req.body.sort;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "e2score/marquee" }, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(req.file.buffer);
      });
    };

    const result = await uploadToCloudinary();
    const image = result.secure_url;

    const marquee = new Marquee({ title, image, sort });
    await marquee.save();
    res
      .status(200)
      .json({ message: "Marquee added successfully", marquee, success: true });
  } catch (err) {
    console.log(err);
  }
};

//edit marquee
export const editMarquee = async (req, res) => {
  const { _id, title, sort } = req.body;
  try {
    if (!_id) {
      return res.status(400).json({ message: "Marquee ID is required" });
    }
    const marquee = await Marquee.findById(_id);
    if (!marquee) {
      return res.status(404).json({ message: "Marquee not found" });
    }
    // Image upload if file is provided
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "e2score/marquee" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(req.file.buffer);
        });
      };

      const result = await uploadToCloudinary();
      marquee.image = result.secure_url;
    }
    marquee.title = title;
    marquee.sort = sort;
    await marquee.save();
    res.status(200).json({
      message: "Marquee updated successfully",
      marquee,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

//delete marquee
export const deleteMarquee = async (req, res) => {
  const { _id } = req.body;
  try {
    if (!_id) {
      return res.status(400).json({ message: "Marquee ID is required" });
    }
    const marquee = await Marquee.findById(_id);
    if (!marquee) {
      return res.status(404).json({ message: "Marquee not found" });
    }
    marquee.is_del = true;
    await marquee.save();
    res.status(200).json({ message: "Marquee deleted successfully" });
  } catch (err) {
    console.log(err);
  }
};

//toggle marquee status
export const toggleMarqueeStatus = async (req, res) => {
  const { _id, is_active } = req.body;
  try {
    if (!_id) {
      return res.status(400).json({ message: "Marquee ID is required" });
    }
    const marquee = await Marquee.findById(_id);
    if (!marquee) {
      return res.status(404).json({ message: "Marquee not found" });
    }
    marquee.is_active = !is_active;
    await marquee.save();
    res.status(200).json({ message: "Marquee status updated successfully" });
  } catch (err) {
    console.log(err);
  }
};

//list marquee
export const All_listMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.find({ is_del: false }).sort({ sort: 1 });
    res.status(200).json({ data: marquee, success: true });
  } catch (err) {
    console.log(err);
  }
};

//only active marquee
export const listMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.find({ is_del: false, is_active: true }).sort(
      {
        sort: 1,
      }
    );
    res.status(200).json({ data: marquee, success: true });
  } catch (err) {
    console.log(err);
  }
};
