"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface VideoInfoProps {
  video: any;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const [likes, setlikes] = useState<number>(video?.Like || 0);
  const [dislikes, setDislikes] = useState<number>(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    setlikes(video?.Like || 0);
    setDislikes(video?.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Title */}
      <h1 className="text-lg sm:text-xl font-semibold">
        {video.videotitle}
      </h1>

      {/* Channel + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
            <AvatarFallback>
              {(video?.videochanel && video.videochanel[0]) || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium text-sm sm:text-base">
              {video.videochanel}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              1.2M subscribers
            </p>
          </div>

          <Button size="sm" className="ml-2 sm:ml-4">
            Subscribe
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Like / Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full text-xs sm:text-sm"
            >
              <ThumbsUp className="w-4 h-4 mr-1 sm:mr-2" />
              {likes.toLocaleString()}
            </Button>

            <div className="w-px h-5 bg-gray-300" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full text-xs sm:text-sm"
            >
              <ThumbsDown className="w-4 h-4 mr-1 sm:mr-2" />
              {dislikes.toLocaleString()}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full text-xs sm:text-sm"
          >
            <Clock className="w-4 h-4 mr-1 sm:mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full text-xs sm:text-sm"
          >
            <Share className="w-4 h-4 mr-1 sm:mr-2" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            Download
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-green-100 rounded-full text-xs sm:text-sm"
          >
            Upgrade Plan
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-medium mb-2">
          <span>{(video.views || 0).toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>

        <div
          className={`text-xs sm:text-sm ${
            showFullDescription ? "" : "line-clamp-3"
          }`}
        >
          <p>{video.description}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium text-xs sm:text-sm"
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-5 sm:p-6 rounded-lg text-center space-y-4 shadow-xl w-full max-w-sm">
            <h2 className="text-base sm:text-lg font-bold">
              Download Limit Reached
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Upgrade to <b>Premium</b> to download unlimited videos.
            </p>

            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              Upgrade to Premium
            </Button>

            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-5 sm:p-6 rounded-lg text-center space-y-4 shadow-xl w-full max-w-sm">
            <h2 className="text-base sm:text-lg font-bold">
              Choose a Plan
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Upgrade your watch-time limit.
            </p>

            <div className="space-y-2">
              <Button className="w-full bg-yellow-400 text-black">
                Bronze — ₹10 (7 mins)
              </Button>
              <Button className="w-full bg-slate-700 text-white">
                Silver — ₹50 (10 mins)
              </Button>
              <Button className="w-full bg-amber-700 text-white">
                Gold — ₹100 (Unlimited)
              </Button>
            </div>

            <Button variant="ghost" className="w-full">
              Cancel
            </Button>

            {invoiceUrl && (
              <div className="mt-2 text-[10px] sm:text-xs text-gray-500">
                Test invoice/file path:{" "}
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  {invoiceUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInfo;
