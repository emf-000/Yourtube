"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(true);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const historyData = await axiosInstance.get(`/history/${user?._id}`);
      setHistory(historyData.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading history...</div>;
  }

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      setHistory(history.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 sm:py-12">
        <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12">
        <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No watch history yet
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you watch will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div className="flex justify-between items-center">
        <p className="text-xs sm:text-sm text-gray-600">
          {history.length} videos
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex gap-3 sm:gap-4 group"
          >
            <Link
              href={`/watch/${item.videoid._id}`}
              className="flex-shrink-0"
            >
              <div className="relative w-28 sm:w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoid?.filepath}`}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                  {item.videoid.videotitle}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-gray-600">
                {item.videoid.videochanel}
              </p>

              <p className="text-xs sm:text-sm text-gray-600">
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(
                  new Date(item.videoid.createdAt)
                )}{" "}
                ago
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
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveFromHistory(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from watch history
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
