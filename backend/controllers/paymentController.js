import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";
import User from "../Modals/Auth.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID + "", 
  key_secret: process.env.RAZORPAY_KEY_SECRET + "",
});

export const createOrder = async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 19900, 
      currency: "INR",
      receipt: "premium_purchase",
    });

    res.json(order);
  } catch (err) {
    console.log("payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const activatePremium = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { is_premium: true });

    res.json({ success: true, message: "Premium Activated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
