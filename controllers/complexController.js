import User from "../models/userModel.js";
import ownerdetails from "../models/ownerDetailsModel.js";
import UserVerification from "../models/userVerificationModel.js";

export const getallownerforcompany = async (req, res) => {
  try {
    const userId = req.userId;

    const owners = await ownerdetails.find({ complex_id: userId }).lean();
    if (owners.length === 0) {
      res.status(404).json({ message: "No owners found for this company" });
    } else {
      res.status(200).json({
        success: true,
        data: owners,
        message: "Owners fetched successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getreports = async (req, res) => {
  try {
    const userId = req.userId;

    const reports = await UserVerification.find({ employer_id: userId })
      .select("candidate_name owner_id aadhat_otp createdAt")
      .populate([
        {
          path: "owner_id",
          select: "name flat_no",
        },
        {
          path: "order_ref_id",
          select: "total_amount",
        },
      ])
      .lean();

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for this company" });
    }

    res.status(200).json({
      success: true,
      data: reports,

      message: "Reports fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};
