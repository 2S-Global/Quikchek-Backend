import CompanyPackage from "../models/companyPackageModel.js";

// Utility to parse plan_id string/array
const parsePlanIds = (selected_plan) => {
  if (typeof selected_plan === "string") {
    return selected_plan.split(",").map((id) => id.trim());
  }
  return Array.isArray(selected_plan) ? selected_plan : [];
};

// ✅ Create
export const createCompanyPackage = async (req, res) => {
  try {
    const { companyId, selected_plan, discount_percent } = req.body;

    if (!companyId || !selected_plan ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const finalDiscount = discount_percent ? Number(discount_percent) : 0;

    const planIds = typeof selected_plan === "string"
      ? selected_plan.split(",").map((id) => id.trim())
      : Array.isArray(selected_plan)
      ? selected_plan
      : [];

    const updatedOrCreated = await CompanyPackage.findOneAndUpdate(
      { companyId }, // match by companyId
      {
        companyId,
     selected_plan: planIds,
        discount_percent: finalDiscount,
      },
      {
        new: true,       // return the updated document
        upsert: true,    // create if not exists
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Package created or updated successfully",
      data: updatedOrCreated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getCompanyPackagesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required in body",
      });
    }

    const data = await CompanyPackage.findOne({ companyId })
      .populate("companyId", "name email") // populate user details
     

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data }); // ✅ data is a single object now
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPackageByCompany = async (req, res) => {
  try {
    const companyId = req.userId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }

    const data = await CompanyPackage.findOne({ company_id: companyId })
      .populate("companyId", "name email") // populate user info
      .populate("selected_plan"); // populate plan info (optional)

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




