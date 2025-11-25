"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    videoUrl: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useUser();

  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    let allowedSeconds = 0;
    const plan = user?.plan || "free";

    if (plan === "free") allowedSeconds = 5 * 60;
    if (plan === "bronze") allowedSeconds = 7 * 60;
    if (plan === "silver") allowedSeconds = 10 * 60;
    if (plan === "gold") allowedSeconds = Infinity;

    const stopVideo = () => {
      // ⛔ Freeze video exactly at limit
      videoEl.pause();
      videoEl.currentTime = allowedSeconds;

      // ⛔ Disable play button
      videoEl.controls = false;

      setLimitReached(true);

      alert("⛔ Your watch time is over. Upgrade your plan to watch full video.");
    };

    const checkTime = () => {
      if (!limitReached && videoEl.currentTime >= allowedSeconds) {
        stopVideo();

        // 🚀 Remove listener so event never fires again
        videoEl.removeEventListener("timeupdate", checkTime);
      }
    };

    videoEl.addEventListener("timeupdate", checkTime);

    return () => {
      videoEl.removeEventListener("timeupdate", checkTime);
    };
  }, [user, limitReached]);

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
