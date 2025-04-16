import mongoose from "mongoose";

const companyPackageSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
        },
    plan_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
         
        },
      ],
    discount_percentage: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CompanyPackage", companyPackageSchema);
