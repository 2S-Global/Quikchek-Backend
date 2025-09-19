import mongoose from "mongoose";
import CompanyPackage from "../../models/companyPackageModel.js";
import Package from "../../models/packageModel.js";

/**
 * Get selected package names for one or multiple companies
 * @param {String[]|mongoose.Types.ObjectId[]} companyIds
 * @returns {Promise<Object>} map of companyId -> comma-separated package names
 */
export const getPackageNamesByCompanyIds = async (companyIds) => {
  try {
    // Normalize input to array
    const ids = Array.isArray(companyIds) ? companyIds : [companyIds];

    // Convert strings to ObjectId if needed
    const objectIds = ids.map((id) =>
      typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
    );

    // Find all company packages and populate package names
    const companyPackages = await CompanyPackage.find({
      companyId: { $in: objectIds },
      is_del: false,
    }).populate("selected_plan", "name");

    // Create map: companyId -> comma-separated package names
    const packageMap = {};
    companyPackages.forEach((cp) => {
      const names = cp.selected_plan.map((pkg) => pkg.name).join(", ");
      packageMap[cp.companyId.toString()] = names;
    });

    // For companies with no packages, default to empty string
    objectIds.forEach((id) => {
      const key = id.toString();
      if (!packageMap[key]) packageMap[key] = "";
    });

    return packageMap;
  } catch (error) {
    console.error("Error fetching package names:", error.message);
    throw new Error("Could not fetch package names");
  }
};
