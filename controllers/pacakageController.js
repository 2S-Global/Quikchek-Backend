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

export const deletePackage = async (req, res) => {
  try {
  const { id } = req.body; 

    const deleted = await Package.findByIdAndUpdate(
      id,
      { is_del: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Package not found" });
    }

  res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting package", error: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const {
      id,
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

    const updated = await Package.findByIdAndUpdate(
      id,
      {
        name,
        transaction_fee,
        description,
        transaction_gst: transaction_gst || 18,
        allowed_verifications: parsedVerifications,
        expiryDate,
      },
      { new: true } // Return the updated document
    );

    if (!updated) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json({success: true, message: "Package updated successfully", data: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating package", error: error.message });
  }
};



