import express from "express";
import { login, verifyOtp,  getUser, updateprofile } from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOtp);
routes.post("/get-user", getUser);
routes.patch("/update/:id", updateprofile);

export default routes;
