import mongoose from "mongoose";

const userVerificationCartSchema = new mongoose.Schema(
    {
        employer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order_ref_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'allOrdersData',
            },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package',
        }, 
        amount: {
            type: String,
            required: true
        }, 
        candidate_name: {
            type: String,
            required: true,
        },
        candidate_email: {
            type: String,
            required: true,
        },
        candidate_mobile: {
            type: String,
        },
        candidate_dob: {
            type: String,
            required: true,
        },
        candidate_address: {
            type: String,
        },
        candidate_gender: {
            type: String, // Fixed typo
        },
        pan_name: {
            type: String, // Fixed typo
        },
        pan_number: {
            type: String, // Fixed typo
        },
        pan_image: {
            type: String, // Ensure marks is stored properly
        },
        pan_response: { 
            type: Object
        },
        aadhar_name: {
            type: String, // Fixed typo
        },
        aadhar_number: {
            type: String, // Fixed typo
        },
        aadhar_image: {
            type: String, // Ensure marks is stored properly
        },
        aadhaar_response: { 
            type: Object
        },
        dl_name: {
            type: String, // Fixed typo
        },
        dl_number: {
            type: String, // Fixed typo
        },
        dl_image: {
            type: String, // Ensure marks is stored properly
        },
        dl_response: { 
            type: Object
        },
        passport_name: {
            type: String, // Fixed typo
        },
        passport_file_number: {
            type: String, // Fixed typo
        },
        passport_image: {
            type: String, // Ensure marks is stored properly
        },
        passport_response: { 
            type: Object
        },
        epic_name: {
            type: String, // Fixed typo
        },
        epic_number: {
            type: String, // Fixed typo
        },
        epic_image: {
            type: String, // Ensure marks is stored properly
        },
        epic_response: { 
            type: Object
        },
        uan_name: {
        type:String,
         },
        uan_number: {
        type:String,
         },
        uan_image: {
        type:String,
        },
       uan_response: { 
            type: Object
        },
        epfo_name:{
            type:String,
        },
        epfo_number:{
            type:String,
        },
        epfo_response :{
        type: Object
        },
        additionalfields :{
            type: String
            },                  
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        is_paid: { 
            type: Number, 
            default: 0 
        },

        is_del: {
            type: Boolean,
            default: false,
        },
        all_verified:{
             type: Number,
            default: 0,
    }
    },
    {
        timestamps: true,
    }
);

const UserCartVerification = mongoose.model("UserVerificationCart", userVerificationCartSchema);

export default UserCartVerification;
