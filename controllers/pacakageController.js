import Package from "../models/packageModel.js"; 



export const addPackage = async (req, res) => {
  try {
    const {
      name,
      transaction_fee,
      description,
      transaction_gst,
      allowed_verifications,
      expiryDate,
    } = req.body;

 

    const parsedVerifications =
      typeof allowed_verifications === "string"
        ? allowed_verifications.split(",").map((item) => item.trim())
        : Array.isArray(allowed_verifications)
        ? allowed_verifications
        : [];

    const newPackage = new Package({
      name,
      transaction_fee,
      description,
      transaction_gst: transaction_gst || 18,
      allowed_verifications: parsedVerifications,
      expiryDate: expiryDate, 
    });

    const savedPackage = await newPackage.save();
    res.status(201).json({ message: "Package added successfully", data: savedPackage });
  } catch (error) {
    res.status(500).json({ message: "Error adding package", error: error.message });
  }
};


import Package from "../models/packageModel.js";

export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ is_del: false });

    const transformedPackages = packages.map(pkg => {
      const pkgObj = pkg.toObject();
      pkgObj.allowed_verifications = pkg.allowed_verifications.join(", ");
      return pkgObj;
    });

    res.status(200).json({
      message: "Packages fetched successfully",
      data: transformedPackages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching packages",
      error: error.message,
    });
  }
};



