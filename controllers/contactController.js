import Contact from "../models/contactModels.js";

// @desc    Add new contact
// @route   POST /api/contacts/add
// @access  Public
export const addContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};
