import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videotitle: { type: String, required: true },
    filename: { type: String },
    filetype: { type: String },
    filesize: { type: Number },
    videochanel: { type: String, required: true },
    Like: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    uploader: { type: String },

    videoUrl: { type: String, required: true },
    cloudinary_id: { type: String, required: true },

    duration: { type: Number, default: 0 },
    thumbnail: { type: String },

    filepath: { type: String }, 
  },
  { timestamps: true }
);


export default mongoose.model("videofiles", videoSchema);
