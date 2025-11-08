import fs from "fs";
import path from "path";
import video from "../Modals/video.js";


export const uploadvideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a video file" });
  }

  try {
    const filename = req.file.filename;

    const newVideo = await video.create({
      videotitle: req.body.videotitle,
      filename: filename,                                 
      filepath: path.join("uploads", filename),            
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,

      // ✅ generate stream URL
      videoUrl: `${process.env.BASE_URL}/video/stream/${filename}`,
    });

    return res.status(201).json({
      message: "file uploaded successfully",
      video: newVideo,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).json(files);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(videoPath)) {
      console.log(" FILE NOT FOUND:", videoPath);
      return res.status(404).send("Video not found");
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      return res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Disposition": "inline",
        "Content-Length": fileSize,
      }).end(fs.readFileSync(videoPath));
    }

    const CHUNK_SIZE = 1 * 1024 * 1024; 
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline", 
    });

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);

  } catch (error) {
    console.error("Stream Error:", error);
    res.status(500).send("Error streaming video");
  }
};
