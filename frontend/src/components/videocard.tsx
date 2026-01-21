"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  const formatDuration = (sec: number) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const thumbnail = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/so_1/${video.cloudinary_id}.jpg`;

  return (
    <Link href={`/watch/${video?._id}`} className="group">
      <div className="space-y-2 sm:space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={thumbnail}
            className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
            alt={video.videotitle}
          />

          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 text-white text-[10px] sm:text-xs px-1 rounded">
            {formatDuration(video.duration || 0)}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">
              {video?.videochanel[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-blue-600">
              {video?.videotitle}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {video?.videochanel}
            </p>

            <p className="text-xs sm:text-sm text-gray-600">
              {video?.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
