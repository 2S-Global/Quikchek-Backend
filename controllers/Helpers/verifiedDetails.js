import UserVerification from "../../models/userVerificationModel.js";

const userVerifiedDetails = async (userId) => {
    try {
        const user = await UserVerification.findById(userId).lean();
        if (!user) {
            throw new Error("User not found");
        }

        // Map of: name_field + number_field → label
        const docMap = [
            { nameField: "pan_name", numberField: "pan_number", label: "Pan" },
            { nameField: "aadhar_name", numberField: "aadhar_number", label: "Aadhaar" },
            { nameField: "dl_name", numberField: "dl_number", label: "Driving License" },
            { nameField: "passport_name", numberField: "passport_file_number", label: "Passport" },
            { nameField: "epic_name", numberField: "epic_number", label: "Voter Id" },
            { nameField: "uan_name", numberField: "uan_number", label: "UAN" },
            { nameField: "epfo_name", numberField: "epfo_number", label: "EPFO" },
        ];

        const verifiedDocs = [];

        docMap.forEach(({ nameField, numberField, label }) => {
            const nameVal = user[nameField];
            const numberVal = user[numberField];

            if (
                typeof nameVal === "string" &&
                typeof numberVal === "string" &&
                nameVal.trim() &&
                numberVal.trim()
            ) {
                verifiedDocs.push(label);
            }
        });

        return verifiedDocs.join(", ");

    } catch (error) {
        console.error("Error in getVerifiedDocuments:", error.message);
        return [];
    }
};

export default userVerifiedDetails;
