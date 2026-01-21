"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";

interface VideopplayerProps {
  video: any;
  onShowComments: () => void;
}

export default function Videopplayer({
  video,
  onShowComments,
}: VideopplayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();

  const [limitReached, setLimitReached] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<null | "left" | "right">(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/${video.cloudinary_id}`;

  /* ================= WATCH TIME LIMIT ================= */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let allowedSeconds = 0;
    const plan = user?.plan || "free";

    if (plan === "free") allowedSeconds = 5 * 60;
    if (plan === "bronze") allowedSeconds = 7 * 60;
    if (plan === "silver") allowedSeconds = 10 * 60;
    if (plan === "gold") allowedSeconds = Infinity;

    const check = () => {
      if (!limitReached && el.currentTime >= allowedSeconds) {
        el.pause();
        setIsPlaying(false);
        setLimitReached(true);
        alert("⛔ Your watch time is over.");
      }
    };

    el.addEventListener("timeupdate", check);
    return () => el.removeEventListener("timeupdate", check);
  }, [user, limitReached]);

  /* ================= VIDEO SYNC ================= */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      setProgress(video.currentTime);
      setDuration(video.duration || 0);
    };

    video.addEventListener("timeupdate", update);
    video.addEventListener("loadedmetadata", update);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("loadedmetadata", update);
    };
  }, []);

  /* ================= SHOW / HIDE CONTROLS ================= */
  const showControlsTemporarily = () => {
    setShowControls(true);

    if (hideTimer.current) clearTimeout(hideTimer.current);

    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  /* ================= GESTURES ================= */
  useEffect(() => {
    const container = containerRef.current;
    const videoEl = videoRef.current;
    if (!container || !videoEl) return;

    let tapCount = 0;
    let tapTimer: any = null;
    const TAP_WINDOW = 420;

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      showControlsTemporarily();
      if (limitReached) return;

      tapCount++;
      if (tapTimer) clearTimeout(tapTimer);

      tapTimer = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        const area =
          x < width * 0.33
            ? "left"
            : x > width * 0.66
            ? "right"
            : "center";

        // SINGLE TAP
        if (tapCount === 1 && area === "center") {
          if (videoEl.paused) {
            videoEl.play();
            setIsPlaying(true);
          } else {
            videoEl.pause();
            setIsPlaying(false);
          }
        }

        //  DOUBLE TAP
        else if (tapCount === 2) {
          if (area === "right") {
            videoEl.currentTime += 10;
            setSeekFeedback("right");
          }
          if (area === "left") {
            videoEl.currentTime -= 10;
            setSeekFeedback("left");
          }
          setTimeout(() => setSeekFeedback(null), 400);
        }

        //  TRIPLE TAP
        else if (tapCount >= 3) {
          if (area === "left") onShowComments();
          if (area === "center") alert("Next video");
          if (area === "right") window.location.href = "/";
        }

        tapCount = 0;
        tapTimer = null;
      }, TAP_WINDOW);
    };

    container.addEventListener("pointerdown", onPointerDown);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      if (tapTimer) clearTimeout(tapTimer);
    };
  }, [limitReached, onShowComments]);

  return (
    <div
      ref={containerRef}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {showControls && !limitReached && (
        <div className="absolute bottom-3 left-3 right-3 text-white space-y-2">
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            step={0.1}
            onChange={(e) => {
              if (videoRef.current)
                videoRef.current.currentTime = Number(e.target.value);
            }}
            className="w-full accent-red-600 cursor-pointer"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (!videoRef.current) return;
                if (videoRef.current.paused) {
                  videoRef.current.play();
                  setIsPlaying(true);
                } else {
                  videoRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              className="text-xl"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <span className="text-sm opacity-80">
              {Math.floor(progress / 60)}:
              {String(Math.floor(progress % 60)).padStart(2, "0")} /
              {Math.floor(duration / 60)}:
              {String(Math.floor(duration % 60)).padStart(2, "0")}
            </span>

            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="ml-auto"
            >
              ⛶
            </button>
          </div>
        </div>
      )}

      {seekFeedback && (
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-full mx-auto">
            {seekFeedback === "right" ? "+10s" : "-10s"}
          </div>
        </div>
      )}
    </div>
  );
}
