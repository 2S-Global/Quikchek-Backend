import UserVerification from "../../models/userVerificationModel.js";
import User from "../../models/userModel.js";
import allOrdersData from "../../models/allOrders.js";

export const getInvoiceData = async (order_id) => {
  if (!order_id) throw new Error("Order ID is required");
  const all_status = await allOrdersData.findById(order_id).lean();
  if (!all_status) throw new Error("Order status not found");

  const company_details = await User.findById(all_status.employer_id).lean();
  if (!company_details) throw new Error("Company not found");

  const payments = await UserVerification.find({
    order_ref_id: order_id,
  }).lean();

  const payment_withdata = payments.map((payment) => {
    const payFor = [];
    if (payment.pan_number) payFor.push("PAN");
    if (payment.aadhar_number) payFor.push("Aadhar");
    if (payment.dl_number) payFor.push("Driving Licence");
    if (payment.passport_file_number) payFor.push("Passport");
    if (payment.epic_number) payFor.push("EPIC");
    if (payment.uan_number) payFor.push("UAN");

    return {
      ...payment,
      payFor: payFor.join(", "),
    };
  });

  return {
    company_details,
    all_status,
    payments: payment_withdata,
  };
};
