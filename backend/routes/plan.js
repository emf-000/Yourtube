import express from "express";
import {
  createPlanOrder,
  handlePlanPaymentSuccess,
} from "../controllers/planController.js";

const router = express.Router();

router.post("/order", createPlanOrder);
router.post("/success", handlePlanPaymentSuccess);

export default router;
