import User from "../Modals/Auth.js";
import Video from "../Modals/video.js";

export const handleVideoDownload = async (req, res) => {
  try {
    const { userId } = req.body;
    const { videoId } = req.params;

    const user = await User.findById(userId);
    const video = await Video.findById(videoId);

    const today = new Date().setHours(0, 0, 0, 0);

    //  Reset daily download limit
    if (!user.download_reset_at || user.download_reset_at < today) {
      user.download_count = 0;
      user.download_reset_at = today;
    }

    //  Free user = Only 1 download per day
    if (!user.is_premium && user.download_count >= 1) {
      return res.json({ success: false, upgradeRequired: true });
    }

    //  Prevent duplicates in downloaded_videos array
    if (!user.downloaded_videos.includes(videoId)) {
      user.downloaded_videos.push(videoId);
    }

    //  Increase download count
    user.download_count += 1;

    await user.save();

    return res.json({
      success: true,
      downloadUrl: video.videoUrl,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getDownloadedVideos = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch full video documents
    const videos = await Video.find({
      _id: { $in: user.downloaded_videos }
    });

    return res.json({
      success: true,
      downloads: videos
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteDownload = async (req, res) => {
  try {
    const { videoId, userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { downloaded_videos: videoId } }, 
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, message: "Video removed from downloads ✅" });

  } catch (error) {
    console.log("DELETE error:", error);
    res.status(500).json({ error: error.message });
  }
};

