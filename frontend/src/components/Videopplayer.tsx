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
  const { user } = useUser();

  const [limitReached, setLimitReached] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<null | "left" | "right">(null);

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
        el.controls = false;
        setLimitReached(true);
        alert("⛔ Your watch time is over.");
      }
    };

    el.addEventListener("timeupdate", check);
    return () => el.removeEventListener("timeupdate", check);
  }, [user, limitReached]);

  /* ================= GESTURES ================= */
  useEffect(() => {
    const container = containerRef.current;
    const videoEl = videoRef.current;
    if (!container || !videoEl) return;

    let tapCount = 0;
    let tapTimer: any = null;

    const TAP_WINDOW = 420;

    const onPointerDown = (e: PointerEvent) => {
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

        if (tapCount === 1 && area === "center") {
          videoEl.paused ? videoEl.play() : videoEl.pause();
        } else if (tapCount === 2) {
          if (area === "right") {
            videoEl.currentTime += 10;
            setSeekFeedback("right");
          }
          if (area === "left") {
            videoEl.currentTime -= 10;
            setSeekFeedback("left");
          }
          setTimeout(() => setSeekFeedback(null), 400);
        } else if (tapCount >= 3) {
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
      className="
        relative
        w-full
        bg-black
        rounded-lg
        overflow-hidden
        aspect-video
        sm:aspect-video
        max-h-[60vh]
      "
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {seekFeedback && (
        <div
          className={`absolute inset-0 flex items-center ${
            seekFeedback === "right"
              ? "justify-end pr-8 sm:pr-16"
              : "justify-start pl-8 sm:pl-16"
          } pointer-events-none`}
        >
          <div className="bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg font-semibold">
            {seekFeedback === "right" ? "+10s" : "-10s"}
          </div>
        </div>
      )}
    </div>
  );
}
