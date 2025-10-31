import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: {
      type: String,
      required: true,
      trim: true,
    },
    usercommented: {
      type: String,
      required: true,
    },
    commentedon: {
      type: Date,
      default: Date.now,
    },
    city: {
      type: String,
      default: "Unknown",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    translated: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentSchema);
