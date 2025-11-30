import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import User from "../Modals/Auth.js";
import { PLANS } from "../config/plans.js";
import dotenv from "dotenv";
import crypto from "crypto";
import Brevo from "sib-api-v3-sdk";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --------------------------------------------------
// CREATE RAZORPAY ORDER FOR PLAN
// --------------------------------------------------
export const createPlanOrder = async (req, res) => {
  try {
    const { plan, userId } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });

    const amountInPaise = PLANS[plan].price * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `plan_${plan}_${Date.now()}`,
      notes: { plan },
    });

    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------------------
// VERIFY PAYMENT + ACTIVATE PLAN
// --------------------------------------------------
export const handlePlanPaymentSuccess = async (req, res) => {
  try {
    const {
      userId,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!userId || !plan || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.plan = plan;
    user.plan_updated_at = new Date();
    user.watch_limit_minutes =
      PLANS[plan].minutes === Infinity ? 0 : PLANS[plan].minutes;

    // Save payment record
    const paymentRecord = {
      plan,
      amount: PLANS[plan].price,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      date: new Date()
    };

    user.payments.push(paymentRecord);
    await user.save();

    res.json({ success: true, message: "Plan Activated Successfully" });

    const invoicePDF = await generateInvoicePdf(user, paymentRecord);

    sendInvoiceEmail(
      user.email,
      user.name || user.email,
      plan,
      paymentRecord.amount,
      invoicePDF
    ).catch(err =>
      console.error("Email send failed (ignored, does NOT affect payment):", err.message)
    );

  } catch (err) {
    console.error("Plan Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// PDF INVOICE
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
      doc.text(`Amount: ₹${payment.amount}`);
      doc.text(`Payment ID: ${payment.razorpay_payment_id}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// --------------------------------------------------
// SEND EMAIL WITH ATTACHMENT
// --------------------------------------------------

const sendInvoiceEmail = async (to, name, plan, amount, pdfBuffer) => {
  try {
    const brevoClient = Brevo.ApiClient.instance;
    brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new Brevo.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject: `YourTube Invoice – ${plan} Plan`,
      textContent: `Hello ${name}, your ${plan} plan is activated.`,

      attachment: [
        {
          name: "invoice.pdf",
          content: pdfBuffer.toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });
  } catch (err) {
    console.error("Brevo API Email Error:", err.message);
  }
};

