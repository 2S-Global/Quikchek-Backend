import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  razorpay_order_id: String,
  amount: Number,
  status: { type: String, default: 'pending' },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
