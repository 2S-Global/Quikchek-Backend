const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String},
  transaction_fee: { type: Number},
  description: { type: String },
  transaction_gst: { type: Number, default: 18 },
  allowed_verifications: { type: [String], default: [] },
  expiryDate: { type: Date },
  is_del: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Package', packageSchema);
