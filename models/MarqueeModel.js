import mongoose from "mongoose";

const marqueeSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  sort: {
    type: Number,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_del: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Marquee = mongoose.model("Marquee", marqueeSchema);
export default Marquee;
