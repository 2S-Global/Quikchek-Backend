import User from "../models/userModel.js";
import ownerdetails from "../models/ownerDetailsModel.js";

export const getallownerforcompany = async (req, res) => {
  try {
    const userId = req.userId;

    const owners = await ownerdetails.find({ complex_id: userId }).lean();
    if (owners.length === 0) {
      res.status(404).json({ message: "No owners found for this company" });
    } else {
      res
        .status(200)
        .json({
          success: true,
          data: owners,
          message: "Owners fetched successfully",
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
