"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function WatchLaterContent() {
  const [watchLater, setWatchLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadWatchLater();
    }
  }, [user]);

  const loadWatchLater = async () => {
    if (!user) return;

    try {
      const watchLaterData = await axiosInstance.get(`/watch/${user?._id}`);
      setWatchLater(watchLaterData.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm sm:text-base">Loading watch later...</div>;
  }

  const handleRemoveFromWatchLater = async (watchLaterId: string) => {
    try {
      setWatchLater(watchLater.filter((item) => item._id !== watchLaterId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 sm:py-12">
        <Clock className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Save videos for later
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Sign in to access your Watch later playlist.
        </p>
      </div>
    );
  }

  if (watchLater.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12">
        <Clock className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No videos saved
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you save for later will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-xs sm:text-sm text-gray-600">
          {watchLater.length} videos
        </p>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {watchLater.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 group"
          >
            <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
              <div className="relative w-full sm:w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoid?.filepath}`}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="font-medium text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 mb-1">
                  {item.videoid.videotitle}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-gray-600">
                {item.videoid.videochanel}
              </p>

              <p className="text-xs sm:text-sm text-gray-600">
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>

              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Added {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="self-start sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveFromWatchLater(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from Watch later
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
