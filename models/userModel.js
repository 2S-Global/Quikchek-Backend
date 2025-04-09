import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    allowed_verifications :{
    type: String,
    },
    
    
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
    },
    transaction_fee: {
        type: String,
    },
    transaction_gst: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    role: {
        /* 0 for admin ,1 for candidate ,2 for company  */
        type: Number,
        required: true,
        default: 1,
    }
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
