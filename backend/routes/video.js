import express from "express";
import uploadCloud from "../middleware/cloudinaryUpload.js";
import { uploadvideo, getallvideo, } from "../controllers/video.js";

const routes = express.Router();

// Upload video to Cloudinary
routes.post("/upload", uploadCloud.single("file"), uploadvideo);
routes.get("/getall", getallvideo);


export default routes;
