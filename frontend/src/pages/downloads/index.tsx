"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";

const DownloadsPage = () => {
  const { user } = useUser();
  const [videos, setVideos] = useState([]);

  // ✅ Fetch downloads list
  const getDownloads = async () => {
    if (!user) return;
    const res = await axiosInstance.get(`/download/user/${user._id}`);
     console.log("downloaded videos:", res.data.downloads); 
    setVideos(res.data.downloads);
  };

  useEffect(() => {
    getDownloads();
  }, [user]);

  if (!user) return <div className="p-6 text-center">Please login.</div>;

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Downloaded Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video: any) => (
          <div key={video._id} className="rounded-xl border shadow">
            <video controls preload="metadata" className="rounded-t-xl w-full">
              <source src={video.videoUrl} type="video/mp4" />
            </video>

            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">{video.videotitle}</h3>

              <button
                className="bg-red-500 hover:bg-red-600 text-white w-full py-1 rounded-md mt-2"
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
