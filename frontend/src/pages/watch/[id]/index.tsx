import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<any>(null);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const res = await axiosInstance.get("/video/getall");
      setVideo(res.data.find((v: any) => v._id === id));
      setAllVideos(res.data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const openComments = () => {
    if (!commentsRef.current) return;
    const top =
      commentsRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="p-4 text-sm sm:text-base text-center">
        Loading...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-4 text-sm sm:text-base text-center">
        Video not found
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <div
        className="
          max-w-6xl mx-auto
          p-2 sm:p-4
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-4 sm:gap-6
        "
      >
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-4">
          <Videopplayer video={video} onShowComments={openComments} />
          <VideoInfo video={video} />

          <div ref={commentsRef}>
            <Comments videoId={id} />
          </div>
        </div>

        {/* RELATED VIDEOS */}
        <div className="lg:col-span-1">
          <RelatedVideos videos={allVideos} />
        </div>
      </div>
    </div>
  );
}
