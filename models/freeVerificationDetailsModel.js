import mongoose from "mongoose";
const verificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    docType: { type: String, enum: ["PAN", "AADHAR", "EPIC", "DL", "PASSPORT", "UAN", "EPFO"], required: true },
    docNumber: { type: String, required: true },
    free: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    paymentId: { type: String }, // only for paid verifications
    createdAt: { type: Date, default: Date.now }
});

const freeVerificationDetail = mongoose.model("freeVerificationDetail", verificationSchema);

export default freeVerificationDetail;