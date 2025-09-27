import UserCartVerification from "../../models/userVerificationCartModel.js";

const getOwnerIdHelper = async (paymentIds) => {
  if (!paymentIds) return [];

  const idsArray = paymentIds.split(",").map((id) => id.trim());

  // fetch all carts in parallel
  const carts = await Promise.all(
    idsArray.map((id) => UserCartVerification.findById(id))
  );

  // filter only carts with owner_id
  const ownerIds = carts
    .filter((cart) => cart && cart.owner_id)
    .map((cart) => cart.owner_id);

  return ownerIds;
};

export default getOwnerIdHelper;
