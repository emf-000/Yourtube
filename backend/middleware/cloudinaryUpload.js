import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary video storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yourtube_videos",
    resource_type: "video",
    format: async (req, file) => "mp4", // Convert all to mp4
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;
