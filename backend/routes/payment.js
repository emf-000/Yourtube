import express from "express";
import { createOrder, activatePremium } from "../controllers/paymentController.js";

const routes = express.Router();

routes.post("/order", createOrder);
routes.post("/success", activatePremium);

export default routes;
