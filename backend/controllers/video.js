import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import video from "../Modals/video.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export const uploadvideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a video file" });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "yourtube",
    });

    const videoUrl = result.secure_url;
    const thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
      resource_type: "video",
      width: 400,
      height: 250,
      crop: "fill",
    });

    // Save video in DB
    const newVideo = await video.create({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,
      videoUrl: videoUrl,              
      cloudinary_id: result.public_id,  
      thumbnail: thumbnailUrl,          
      duration: Math.floor(result.duration || 0), 
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
    

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
};

export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    res.status(200).json(files);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Fetch failed", error });
  }
};


