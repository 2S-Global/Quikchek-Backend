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

    // Log the incoming request body to check the data
    console.log("Request Body:", req.body);

    // Check if allowed_verifications is a string and split it into an array
    const parsedVerifications =
      typeof allowed_verifications === "string"
        ? allowed_verifications.split(",").map((item) => item.trim()) // Split string into array
        : Array.isArray(allowed_verifications)
        ? allowed_verifications
        : [];

    // Log the parsed allowed_verifications before saving
    console.log("Parsed verifications:", parsedVerifications);

    // Create a new package
    const newPackage = new Package({
      name,
      transaction_fee,
      description,
      transaction_gst: transaction_gst || 18,
      allowed_verifications: parsedVerifications, // Store as an array of strings
      expiryDate,
    });

    // Save to the database
    const savedPackage = await newPackage.save();
    res.status(201).json({ message: "Package added successfully", data: savedPackage });
  } catch (error) {
    res.status(500).json({ message: "Error adding package", error: error.message });
  }
};


