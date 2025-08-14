import UserVerification from "../../models/userVerificationModel.js";

const userVerifiedDetails = async (userId) => {
    try {
        const user = await UserVerification.findById(userId).lean();
        if (!user) {
            throw new Error("User not found");
        }

        // Map of field name -> label to return
        const docMap = {
            pan_response: "pan",
            aadhaar_response: "aadhaar",
            aadhar_response: "aadhaar", // In case you have both spellings
            dl_response: "driving_license",
            passport_response: "passport",
            epic_response: "voter_id",
            uan_response: "uan",
            epfo_response: "epfo",
        };

        const verifiedDocs = [];

        for (const [field, label] of Object.entries(docMap)) {
            const resp = user[field];
            if (!resp) continue;

            // Common verification check (customize as per DB data structure)
            const isVerified =
                resp.success === true ||
                resp?.result?.status === "VALID" ||
                resp?.result?.passport_satus === true ||
                resp?.result?.passport_status === true ||
                resp?.result?.pan_status === "VALID";

            if (isVerified) {
                verifiedDocs.push(label);
            }
        }

        return verifiedDocs;

    } catch (error) {
        console.error("Error in getVerifiedDocuments:", error.message);
        return [];
    }
};

export default userVerifiedDetails;
