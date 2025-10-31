import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import axios from "axios";
import { Credentials, Translator } from "@translated/lara";

// --------------------- POST COMMENT ---------------------
export const postcomment = async (req, res) => {
  const commentdata = req.body;

  try {
    let cityName = "Unknown";

    try {
      let ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress?.replace("::ffff:", "") ||
        req.ip;

      if (ip === "127.0.0.1" || ip === "::1") {
        const ipRes = await axios.get("https://api.ipify.org?format=json");
        ip = ipRes.data.ip;
      }

      const geo = await axios.get(`https://ipinfo.io/${ip}/json`);
      cityName = geo.data.city || "Unknown";
    } catch (err) {
      console.log("Location lookup failed:", err.message);
    }

    const newComment = new comment({
      ...commentdata,
      _id: new mongoose.Types.ObjectId(),
      videoid: String(commentdata.videoid),
      city: cityName,
    });

    await newComment.save();
    return res.status(200).json({ comment: newComment });

  } catch (err) {
    console.error("error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- GET COMMENTS ---------------------
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- DELETE COMMENT ---------------------
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- EDIT COMMENT ---------------------
export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- LIKE COMMENT ---------------------
export const likeComment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const cmt = await comment.findById(id);
    if (!cmt) return res.status(404).json({ message: "Comment not found" });

    if (!cmt.likes) cmt.likes = [];
    if (!cmt.dislikes) cmt.dislikes = [];

    cmt.dislikes = cmt.dislikes.filter((id) => id.toString() !== userId);

    if (cmt.likes.includes(userId)) {
      cmt.likes = cmt.likes.filter((id) => id.toString() !== userId);
    } else {
      cmt.likes.push(userId);
    }

    await cmt.save();
    res.status(200).json({ likes: cmt.likes });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- DISLIKE COMMENT ---------------------
export const dislikeComment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const cmt = await comment.findById(id);
    if (!cmt) return res.status(404).json({ message: "Comment not found" });

    if (!cmt.likes) cmt.likes = [];
    if (!cmt.dislikes) cmt.dislikes = [];

    cmt.likes = cmt.likes.filter((id) => id.toString() !== userId);

    if (cmt.dislikes.includes(userId)) {
      cmt.dislikes = cmt.dislikes.filter((id) => id.toString() !== userId);
    } else {
      cmt.dislikes.push(userId);
    }

    if (cmt.dislikes.length >= 2) {
      await comment.findByIdAndDelete(id);
      return res.status(200).json({ removed: true });
    }

    await cmt.save();
    res.status(200).json({ dislikes: cmt.dislikes });
  } catch (error) {
    console.error("Error disliking comment:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// --------------------- AUTO-DETECT TRANSLATION ---------------------
export const translateComment = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text missing." });
  }

  try {
    const credentials = new Credentials(
      String(process.env.LARA_ACCESS_KEY_ID),
      String(process.env.LARA_ACCESS_KEY_SECRET)
    );

    const lara = new Translator(credentials);

    // ✅ Auto-detect language → Translate → English
    const result = await lara.translate(text, undefined, "en");

    return res.status(200).json({ translatedText: result.translation });

  } catch (error) {
    console.error("Lara Translate error:", error.message);
    return res.status(200).json({
      translatedText: text, // fallback
      message: "Translation unavailable, showing original.",
    });
  }
};
