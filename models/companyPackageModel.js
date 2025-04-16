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
  },
  { timestamps: true }
);

export default mongoose.model("CompanyPackage", companyPackageSchema);
