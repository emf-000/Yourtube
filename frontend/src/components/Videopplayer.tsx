"use client";

import { useRef } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    videoUrl: string;  // ✅ Cloudinary URL
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        preload="auto"
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
