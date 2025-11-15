import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import video from "../Modals/video.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "yourtube",
        public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Upload a video file" });

    // Upload buffer to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);

    const thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
      resource_type: "video",
      width: 400,
      height: 250,
      crop: "fill",
    });

    const newVideo = await video.create({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,
      videoUrl: result.secure_url,
      cloudinary_id: result.public_id,
      duration: Math.floor(result.duration || 0),
      thumbnail: thumbnailUrl,
    });

    return res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Upload failed", error: error.message || error });
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


