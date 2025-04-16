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

// ✅ Get All
export const getAllCompanyPackages = async (req, res) => {
  try {
    const data = await CompanyPackage.find()
      .populate("company_id", "name email") // optional
      .populate("plan_id", "name transaction_fee"); // optional

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update
export const updateCompanyPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, plan_id, discount_percentage } = req.body;

    const planIds = parsePlanIds(plan_id);

    const updated = await CompanyPackage.findByIdAndUpdate(
      id,
      { company_id, plan_id: planIds, discount_percentage },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete
export const deleteCompanyPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CompanyPackage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
