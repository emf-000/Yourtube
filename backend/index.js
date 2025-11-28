import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import nodemailer from "nodemailer";   
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import paymentroutes from "./routes/payment.js";
import planroutes from "./routes/plan.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb" }));
app.use(bodyParser.json());

// ROUTES
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadroutes);
app.use("/payment", paymentroutes);
app.use("/plan", planroutes);

console.log("ENV CHECK:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "YES" : "NO",
  from: process.env.EMAIL_FROM,
});


app.get("/debug-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: "Render Gmail STARTTLS Test",
      text: "Email reached Render using STARTTLS!"
    });

    res.send("EMAIL TEST SUCCESS");
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});


// DEFAULT
app.get("/", (req, res) => {
  res.send("Yourtube backend is working ✔✔");
});

// DATABASE CONNECT
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Mongodb connected"))
  .catch((error) => console.log(error));

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));



