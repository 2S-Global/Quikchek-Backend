import Fields from "../models/additionalFieldsModels.js";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";


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

export const editField = async (req, res) => {
    const { id, name, field_type, field_values} = req.body;

    try {
        // Find the field by ID and update it
        const updatedField = await Fields.findByIdAndUpdate(id,
            {
                name,
                field_type,
                field_values,
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true }
        );

        if (!updatedField) {
            return res.status(404).json({ message: "Field not found" });
        }

        res.status(200).json({
            message: "Field updated successfully",
            data: updatedField,
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating field", error: error.message });
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
export const getAllFields = async (req, res) => {
    try {
        const company_id = req.userId;
        // Get company details once
        const company = await User.findById(company_id).select("transaction_fee transaction_gst allowed_verifications");

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // Get fields without repeating company
        const fields = await Fields.find({ company_id, is_del: false }).select("-company_id");

        res.status(200).json({
            success: true,
            message: "Fields fetched successfully",
           // company,
            data: fields,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};

export const listFieldsByCompany = async (req, res) => {
    try {
        const company_id = req.userId;

        const plan_id=req.body.plan_id;

        const company = await User.findById(company_id).select("gst_no");
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        console.log(plan_id);
        const packagedetails = await Package.findById(plan_id).select("transaction_fee transaction_gst allowed_verifications");

        if (!packagedetails) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        console.log(packagedetails.allowed_verifications);

        const allowedTypes = (packagedetails.allowed_verifications || []).map(v => v.trim().toUpperCase());
        
        const allTypes = ["PAN", "AADHAAR", "DL", "EPIC", "PASSPORT", "UAN"];
        const allowedVerificationsObj = {};
        allTypes.forEach(type => {
          allowedVerificationsObj[type] = allowedTypes.includes(type);
        });

        // Overwrite original string field with the object
        const companyData = {
            ...company._doc,
            transaction_fee: packagedetails.transaction_fee,
            transaction_gst: packagedetails.transaction_gst,
            allowed_verifications: packagedetails.allowed_verifications,
            ...allowedVerificationsObj
        };

        // Get fields
        const fields = await Fields.find({ company_id, is_del: false }).select("-company_id");

        res.status(200).json({
            success: true,
            message: "Fields fetched successfully",
            company: companyData,
            data: fields,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};


/*
export const listFieldsByCompany = async (req, res) => {
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
*/
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




