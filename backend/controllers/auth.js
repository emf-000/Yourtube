import mongoose from "mongoose";
import dotenv from "dotenv";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";
import axios from "axios";

dotenv.config();

// OTP Store
const otpStore = new Map();

const SOUTH_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "andhra",
  "telangana",
];

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ======================================================
   LOGIN — Send OTP (Email for South, Voice for Others)
====================================================== */
export const login = async (req, res) => {
  console.log("📩 Incoming login request body:", req.body);

  const { email, name, image, state, phone } = req.body;

  if (!state)
    return res.status(400).json({ message: "State is required" });

  const normalizedState = state.toLowerCase();
  const isSouth = SOUTH_STATES.includes(normalizedState);

  try {
    let user = await users.findOne({ email });

    if (!user) {
      user = await users.create({ email, name, image });
    }

    const otp = generateOtp();

    /* =============================
       SOUTH → SEND EMAIL OTP
    ============================== */
    if (isSouth) {
      const key = email.toLowerCase();
      otpStore.set(key, otp);

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Login OTP",
        text: `Your OTP is ${otp}`,
      });

      console.log("📧 Email OTP sent:", email);

      return res.status(200).json({
        method: "email",
        message: "OTP sent to Email",
        result: user,
      });
    }

    /* =============================
       NON-SOUTH → SEND VOICE OTP
    ============================== */
    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    otpStore.set(phone.trim(), otp);

    try {
      const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/VOICE/${phone}/${otp}`;

      const voiceRes = await axios.get(url);

      return res.status(200).json({
        method: "voice",
        message: "OTP sent via Voice Call",
        result: user,
      });

    } catch (error) {
      console.error("❌ 2Factor Voice OTP Error:", error.response?.data || error.message);
      return res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
      });
    }

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ======================================================
    VERIFY OTP
====================================================== */
export const verifyOtp = (req, res) => {
  const { email, phone, otp, state } = req.body;

  const isSouth = SOUTH_STATES.includes((state || "").toLowerCase());

  const key = isSouth
    ? email.toLowerCase().trim()   
    : phone.trim();                  


  const storedOtp = otpStore.get(key);

  if (!storedOtp)
    return res.status(400).json({ message: "OTP expired or not found" });

  if (storedOtp !== otp.toString().trim()) {
    console.log("❌ OTP mismatch → entered:", otp, "expected:", storedOtp);
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(key);

  return res.status(200).json({ message: "OTP verified successfully" });
};

/* ======================================================
    GET USER — Auto Login
====================================================== */
export const getUser = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await users.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ result: user });

  } catch (err) {
    console.error("❌ Get User Error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ======================================================
    UPDATE PROFILE
====================================================== */
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updated = await users.findByIdAndUpdate(
      _id,
      { channelname, description },
      { new: true }
    );

    return res.status(200).json(updated);

  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
