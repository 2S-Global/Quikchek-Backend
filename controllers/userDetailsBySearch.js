import UserVerification from "../models/userVerificationModel.js";

export const getUserVerificationDetails = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id is required",
      });
    }

    // Prepend "ORD-" since DB values start with this
    const formattedOrderId = `ORD-${order_id}`;

    const verificationDetails = await UserVerification.find({
      order_id: formattedOrderId,
      is_del: false
    }).lean();

    if (!verificationDetails || verificationDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No verification details found for the given order_id",
      });
    }

    const transformedData = verificationDetails.map((doc) => {

      const verificationDate = new Date(doc.updatedAt);
      const formattedDate = verificationDate.toLocaleDateString("en-GB");

      return {
        _id: doc._id,
        candidate_name: doc.candidate_name || null,
        candidate_mobile: doc.candidate_mobile || null,
        order_id: doc.order_id,
        verification_date: formattedDate,
        documents_verified: {
          pan: doc.pan_response?.success === true && doc.pan_response?.result?.pan_status === "VALID",
          aadhaar: doc.aadhaar_response?.success === true,
          passport: doc.passport_response?.success === true,
          epic: doc.epic_response?.success === true,
          driving_license: doc.dl_response?.success === true
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error fetching verification details:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching verification details",
      error: error.message,
    });
  }
};