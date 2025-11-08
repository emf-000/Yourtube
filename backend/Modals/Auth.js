import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },

  download_count: { type: Number, default: 0 },
  download_reset_at: { type: Date, default: null },
  is_premium: { type: Boolean, default: false },

  downloaded_videos: [
    { type: mongoose.Schema.Types.ObjectId, ref: "videofiles" }
  ],
});

export default mongoose.model("user", userschema);
