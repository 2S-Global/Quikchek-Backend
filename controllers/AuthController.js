import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, transaction_fee, transaction_gst } = req.body;
        const role = 1;
        // Validate required fields
        if (!name || !email || !password || !transaction_fee || !transaction_gst) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with hashed password
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            success: true,
            message: "User registered and logged in successfully!",
            token,
            /*  data: newUser, */
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// Register a new company
export const registerCompany = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const role = 1;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with hashed password
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            success: true,
            message: "User registered and logged in successfully!",
            token,
            /*  data: newUser, */
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};
// Login a user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // If password is hashed, compare using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            data: user,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
};

export const listCompanies = async (req, res) => {
    try {

        // Fetch projects for the given user_id where is_del is false
        const allcompanies = await User.find({ is_del: false, role: 1 }).select('-password');

        if (!allcompanies.length) {
            return res.status(404).json({ message: "No projects found for this user" });
        }

        res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            data: allcompanies,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving projects", error: error.message });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.body;

        // Validate and convert companyId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ success: false, message: "Invalid company ID" });
        }

        const objectId = new mongoose.Types.ObjectId(companyId);

        // Find and update the company
        const deletedCompany = await User.findOneAndUpdate(
            { _id: objectId, role: 1, is_del: false },
            { is_del: true, updatedAt: new Date() },
            { new: true }
        );

        if (!deletedCompany) {
            return res.status(404).json({ success: false, message: "Company not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: "Company deleted successfully",
            data: deletedCompany
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting company", error: error.message });
    }
};


export const toggleCompanyStatus = async (req, res) => {
    try {
        const { status, companyId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ success: false, message: "Invalid company ID" });
        }

        if (typeof status !== "boolean") {
            return res.status(400).json({ success: false, message: "Invalid status value. It must be true or false." });
        }

        const objectId = new mongoose.Types.ObjectId(companyId);

        const updatedCompany = await User.findOneAndUpdate(
            { _id: objectId, role: 1, is_del: false }, // 👈 FIXED HERE
            { is_active: status, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            message: `Company has been ${status ? "activated" : "deactivated"} successfully`,
            data: updatedCompany
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating company status", error: error.message });
    }
};
