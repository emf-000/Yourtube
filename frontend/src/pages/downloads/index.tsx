"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

const DownloadsPage = () => {
  const { user } = useUser();
  const [videos, setVideos] = useState<any[]>([]);

  const getDownloads = async () => {
    if (!user) return;
    const res = await axiosInstance.get(`/download/user/${user._id}`);
    setVideos(res.data.downloads);
  };

  useEffect(() => {
    getDownloads();
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 sm:p-6 text-center text-sm sm:text-base">
        Please login.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 w-full max-w-7xl mx-auto">
      <h1 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">
        Downloaded Videos
      </h1>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-3 sm:gap-4
        "
      >
        {videos.map((video: any) => (
          <div
            key={video._id}
            className="rounded-xl border shadow-sm overflow-hidden"
          >
            <video
              controls
              playsInline
              preload="none"
              className="w-full h-auto"
            >
              <source src={video.videoUrl} type="video/mp4" />
            </video>

            <div className="p-3">
              <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">
                {video.videotitle}
              </h3>

              <button
                className="
                  bg-red-500 hover:bg-red-600
                  text-white
                  w-full
                  py-1.5 sm:py-2
                  rounded-md
                  mt-2
                  text-xs sm:text-sm
                "
                onClick={() =>
                  axiosInstance
                    .delete(`/download/${video._id}/${user._id}`)
                    .then(() => getDownloads())
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadsPage;
