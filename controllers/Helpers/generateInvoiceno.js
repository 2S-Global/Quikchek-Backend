import allOrdersData from "../../models/allOrders.js";

const generateInvoiceNo = async () => {
  try {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const temp_inv1 = "QKCK-" + month + "" + year;
    const invoiceNumber = await allOrdersData.find({
      invoice_number: { $regex: `^${temp_inv1}` },
    });
    if (invoiceNumber.length === 0) {
      return temp_inv1 + "-0001";
    }
    let maxSerial = 0;
    for (let i = 0; i < invoiceNumber.length; i++) {
      const inv = invoiceNumber[i].invoice_number;
      const parts = inv.split("-");
      const prefix = parts.slice(0, 2).join("-") + "-";
      const serial = parts[2];
      const serialNumber = parseInt(serial, 10);
      if (serialNumber > maxSerial) {
        maxSerial = serialNumber;
      }
    }
    const new_Serial = parseInt(maxSerial) + 1;
    const laststring = "000" + new_Serial;
    const main_inv = temp_inv1 + "-" + laststring;
    return main_inv;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return "0001";
  }
};

export default generateInvoiceNo;
