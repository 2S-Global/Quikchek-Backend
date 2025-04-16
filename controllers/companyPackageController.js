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

    if (!companyId || !selected_plan || discount_percent == null) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const planIds = parsePlanIds(selected_plan);

    const newPackage = await CompanyPackage.create({
    companyId,
    selected_plan: planIds,
    discount_percent,
    });

    res.status(200).json({ success: true, data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getCompanyPackagesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: "companyId is required in body" });
    }

    const data = await CompanyPackage.find({ companyId })
      .populate("companyId", "name email") // optional: user info
      .populate("selected_plan", "name transaction_fee description transaction_gst "); // optional: plan info

    if (data.length === 0) {
      return res.status(200).json({ success: false, message: "No packages found for this company" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

