import mongoose from "mongoose";
import dotenv from "dotenv";
import users from "../Modals/Auth.js";
import axios from "axios";
import Brevo from "sib-api-v3-sdk";

dotenv.config();

// ================== BREVO INIT ==================
const brevoClient = Brevo.ApiClient.instance;
brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const brevoApi = new Brevo.TransactionalEmailsApi();

// ================== OTP STORE ==================
const otpStore = new Map();

const SOUTH_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "andhra",
  "telangana",
];

// ================== OTP GENERATOR ==================
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ======================================================
   LOGIN — SEND OTP
====================================================== */
export const login = async (req, res) => {
  console.log("📩 LOGIN REQUEST:", req.body);

  const { email, name, image, state, phone } = req.body;

  if (!email || !state) {
    return res.status(400).json({ message: "Email and state are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedState = state.toLowerCase().trim();
  const normalizedPhone = (phone || "").trim();

  const isSouth = SOUTH_STATES.includes(normalizedState);

  try {
    let user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      user = await users.create({
        email: normalizedEmail,
        name,
        image,
      });
    }

    const otp = generateOtp();

    /* =============================
       SOUTH → EMAIL OTP (BREVO)
    ============================== */
    if (isSouth) {
      const key = `email:${normalizedEmail}`;

      otpStore.set(key, otp);

      try {
        await brevoApi.sendTransacEmail({
          sender: {
            name: "YourTube",
            email: process.env.EMAIL_FROM,
          },
          to: [{ email: normalizedEmail }],
          subject: "YourTube Login OTP",
          htmlContent: `
            <p>Hello,</p>
            <p>Your login code is:</p>
            <p style="font-size:22px;font-weight:600">${otp}</p>
            <p>This code expires in 5 minutes.</p>
            <p>— YourTube</p>
          `,
        });

        console.log("📧 OTP SENT (EMAIL):", normalizedEmail);

        return res.status(200).json({
          method: "email",
          message: "OTP sent to email",
        });

      } catch (err) {
        console.error("❌ BREVO EMAIL ERROR:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    /* =============================
       NON-SOUTH → VOICE OTP
    ============================== */
    if (!normalizedPhone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const phoneKey = `phone:${normalizedPhone}`;
    otpStore.set(phoneKey, otp);

    try {
      const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/VOICE/${normalizedPhone}/${otp}`;
      await axios.get(url);

      console.log("📞 OTP SENT (VOICE):", normalizedPhone);

      return res.status(200).json({
        method: "voice",
        message: "OTP sent via voice call",
      });

    } catch (error) {
      console.error("❌ VOICE OTP ERROR:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ======================================================
   VERIFY OTP
====================================================== */
export const verifyOtp = (req, res) => {
  const { email, phone, otp, state } = req.body;

  if (!otp || !state) {
    return res.status(400).json({ message: "OTP and state are required" });
  }

  const normalizedEmail = (email || "").toLowerCase().trim();
  const normalizedPhone = (phone || "").trim();
  const normalizedState = state.toLowerCase().trim();

  const isSouth = SOUTH_STATES.includes(normalizedState);

  const key = isSouth
    ? `email:${normalizedEmail}`
    : `phone:${normalizedPhone}`;

  const storedOtp = otpStore.get(key);

  console.log("🔍 VERIFY OTP:", {
    key,
    storedOtp,
    enteredOtp: otp,
    store: Array.from(otpStore.entries()),
  });

  if (!storedOtp) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }

  if (storedOtp !== otp.toString().trim()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(key);

  return res.status(200).json({
    message: "OTP verified successfully",
  });
};

/* ======================================================
   GET USER
====================================================== */
export const getUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const user = await users.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ result: user });

  } catch (err) {
    console.error("❌ GET USER ERROR:", err);
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
    console.error("❌ UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
