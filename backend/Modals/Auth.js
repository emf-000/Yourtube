import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },

  plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
  watch_limit_minutes: { type: Number, default: 5 },
  plan_updated_at: { type: Date },

  payments: [
    {
      plan: String,
      amount: Number,
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      invoice_url: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  download_count: { type: Number, default: 0 },
  download_reset_at: { type: Date, default: null },
  is_premium: { type: Boolean, default: false },

  downloaded_videos: [
    { type: mongoose.Schema.Types.ObjectId, ref: "videofiles" }
  ],
});

export default mongoose.model("user", userschema);
