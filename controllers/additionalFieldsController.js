import Fields from "../models/additionalFieldsModels.js";



// Register a new user
export const addField = async (req, res) => {
    try {
        const { company_id, name, field_type, field_values } = req.body;

        if (!company_id || !name || !field_type) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newField = new Fields({
            company_id,
            name,
            field_type,
            field_values
        });

        const savedField = await newField.save();

        res.status(201).json({
            success: true,
            message: "Field added successfully",
            data: savedField
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding field33", error: error.message });
    }
};

export const listFields = async (req, res) => {
    try {
        const { company_id } = req.body;

        const fields = await Fields.find({ company_id, is_del: false });

        res.status(200).json({
            success: true,
            message: "Fields fetched successfully",
            data: fields
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};

export const deleteField = async (req, res) => {
    try {
        const { fieldId } = req.body;

        const deletedField = await Fields.findOneAndUpdate(
            { _id: fieldId, is_del: false },
            { is_del: true, updatedAt: new Date() },
            { new: true }
        );

        if (!deletedField) {
            return res.status(404).json({ success: false, message: "Field not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: "Field deleted successfully",
            data: deletedField
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting field", error: error.message });
    }
};




