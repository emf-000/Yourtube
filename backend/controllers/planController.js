import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import User from "../Modals/Auth.js";
import { PLANS } from "../config/plans.js";
import dotenv from "dotenv";
import crypto from "crypto";
import Brevo from "sib-api-v3-sdk";

dotenv.config();

// ================== RAZORPAY INIT ==================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================== BREVO INIT (ONCE) ==================
const brevoClient = Brevo.ApiClient.instance;
brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const brevoApi = new Brevo.TransactionalEmailsApi();

// --------------------------------------------------
// CREATE RAZORPAY ORDER FOR PLAN
// --------------------------------------------------
export const createPlanOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const amountInPaise = PLANS[plan].price * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `plan_${plan}_${Date.now()}`,
      notes: { plan },
    });

    return res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// --------------------------------------------------
// VERIFY PAYMENT + ACTIVATE PLAN + SEND INVOICE
// --------------------------------------------------
export const handlePlanPaymentSuccess = async (req, res) => {
  try {
    const {
      userId,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !userId ||
      !plan ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // ✅ Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Update user plan
    user.plan = plan;
    user.plan_updated_at = new Date();
    user.watch_limit_minutes =
      PLANS[plan].minutes === Infinity ? 0 : PLANS[plan].minutes;

    const paymentRecord = {
      plan,
      amount: PLANS[plan].price,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      date: new Date(),
    };

    user.payments.push(paymentRecord);
    await user.save();

    // ✅ Generate Invoice PDF
    const invoicePDF = await generateInvoicePdf(user, paymentRecord);

    // ✅ Send Invoice Email via BREVO
    try {
      await brevoApi.sendTransacEmail({
        sender: {
          name: "YourTube",
          email: process.env.EMAIL_FROM, // Gmail or domain
        },
        to: [
          {
            email: user.email,
            name: user.name || user.email,
          },
        ],
        subject: `YourTube Invoice – ${plan} Plan`,
        htmlContent: `
          <p>Hello ${user.name || user.email},</p>
          <p>Your <strong>${plan}</strong> plan is activated.</p>
          <p>Amount Paid: ₹${paymentRecord.amount}</p>
        `,
        attachment: [
          {
            name: "invoice.pdf",
            content: invoicePDF.toString("base64"),
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📧 Invoice email sent:", user.email);
    } catch (emailErr) {
      console.error(
        "❌ Brevo invoice email failed:",
        emailErr.response?.body || emailErr
      );
    }

    // ✅ Respond AFTER email attempt
    return res.json({
      success: true,
      message: "Plan Activated Successfully",
    });

  } catch (err) {
    console.error("Plan Payment Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// --------------------------------------------------
// GENERATE PDF INVOICE
// --------------------------------------------------
const generateInvoicePdf = async (user, payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text("YourTube Invoice", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Name: ${user.name || user.email}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Plan: ${payment.plan}`);
      doc.text(`Amount Paid: ₹${payment.amount}`);
      doc.text(`Payment ID: ${payment.razorpay_payment_id}`);
      doc.text(`Date: ${new Date(payment.date).toLocaleString()}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
