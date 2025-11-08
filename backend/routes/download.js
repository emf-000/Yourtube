import express from "express";
import { handleVideoDownload, getDownloadedVideos, deleteDownload } from "../controllers/downloadController.js";

const routes = express.Router();

routes.post("/:videoId", handleVideoDownload);
routes.get("/user/:userId", getDownloadedVideos); 
routes.delete("/:videoId/:userId", deleteDownload);


export default routes;
