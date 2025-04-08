import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    name: {
        type: String,
        required: true,
    },
    field_type: {
        type: String,
        required: true,
    },
    field_values: {
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
    }
}, {
    timestamps: true,
});

const Fields = mongoose.model("Fields", userSchema);

export default Fields;