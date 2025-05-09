import mongoose from "mongoose";

const companyPackageSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
        },
    selected_plan: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
         
        },
      ],
    discount_percent: {
      type: Number,
    },
    aadhar_otp: {
      type: String,
      default: 'disable',
    },
    aadhar_price: {
      type: Number,
    },
    hotel_module: {
      type: String,
      default: 'disable',
    },
    housing_module: {
      type: String,
      default: 'disable',
    },
    is_del: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("CompanyPackage", companyPackageSchema);