import mongoose from "mongoose";

const allOrdersSchema = new mongoose.Schema(
    {
        employer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order_number: {
            type: String,
            required: true,
        },
        invoice_number: {
            type: String,
            required: true,
        },
        subtotal: {
            type: String,
        },
        cgst: {
            type: String,
            required: true,
        },
        cgst_percent: {
            type: String,
            required: true,
        },
        sgst: {
            type: String,
            required: true,
        },
        sgst_percent: {
            type: String,
            required: true,
        },
        total_amount: {
            type: String,
        },
        discount_percent: {
            type: String, // Fixed typo
        },
        discount_amount: {
            type: String, // Fixed typo
        },
        total_numbers_users: {
            type: String, // Fixed typo
        },                       
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        is_del: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const allOrdersData = mongoose.model("allOrdersData", allOrdersSchema);

export default allOrdersData;
