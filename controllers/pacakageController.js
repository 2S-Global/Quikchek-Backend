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


   if (
       !name ||
      transaction_fee == null ||
      transaction_gst == null ||
      !allowed_verifications
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required:  name, transaction_fee, transaction_gst, allowed_verifications",
      });
    }




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
    const packages = await Package.find({ is_del: false ,is_active:true});

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

    // ✅ Validate required fields
    if (
      !id ||
      !name ||
      transaction_fee == null ||
      transaction_gst == null ||
      !allowed_verifications
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: id, name, transaction_fee, transaction_gst, allowed_verifications",
      });
    }

    // ✅ Normalize `allowed_verifications` to an array
    const parsedVerifications =
      typeof allowed_verifications === "string"
        ? allowed_verifications.split(",").map((item) => item.trim())
        : Array.isArray(allowed_verifications)
        ? allowed_verifications
        : [];

    // ✅ Fetch the existing package
    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // ✅ Update the package with the new data (replace verifications)
    const updated = await Package.findByIdAndUpdate(
      id,
      {
        name,
        transaction_fee,
        description,
        transaction_gst,
        allowed_verifications: parsedVerifications, // 🔥 Replace with new list
        expiryDate,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};

export const toggleStatusPackage = async (req, res) => {
  try {
    const { pack_id } = req.body;

    // Find the package first
    const packageData = await Package.findById(pack_id);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Toggle the is_active status
    const updated = await Package.findByIdAndUpdate(
      pack_id,
      {
        is_active: !packageData.is_active,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};




