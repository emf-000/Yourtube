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

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { user } = useUser();

  // ✅ Like/Dislike reset when video changes
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  // ✅ Add to history
  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        await axiosInstance.post(`/history/${video._id}`, {
          userId: user._id,
        });
      } else {
        await axiosInstance.post(`/history/views/${video._id}`);
      }
    };
    handleviews();
  }, [user, video._id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user._id,
      });
      setIsWatchLater(res.data.watchlater);
    } catch (error) {
      console.log(error);
    }
  };

const handleDownload = async () => {
  if (!user) return alert("Please login to save video");

  try {
    const res = await axiosInstance.post(`/download/${video._id}`, {
      userId: user._id,
    });

    if (res.data.upgradeRequired) {
      setShowPremiumModal(true);
      return;
    }

    alert(" Video added to Downloads");

  } catch (err) {
    console.log(err);
  }
};


  // ✅ Razorpay Payment Popup
  const startRazorpayPayment = async () => {
    try {
      const res = await axiosInstance.post("/payment/order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: res.data.amount,
        currency: res.data.currency,
        name: "YourTube Premium",
        description: "Unlimited downloads subscription",
        order_id: res.data.id,

        handler: async function () {
          await axiosInstance.post("/payment/success", { userId: user._id });
          alert("✅ Premium Activated! You can now download unlimited videos.");
          setShowPremiumModal(false);
        },

        theme: { color: "#FF0000" },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4">Subscribe</Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Like / Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button variant="ghost" size="sm" className="rounded-l-full" onClick={handleLike}>
              <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button variant="ghost" size="sm" className="rounded-r-full" onClick={handleDislike}>
              <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""}`} />
              {dislikes.toLocaleString()}
            </Button>
          </div>

          {/* Watch Later */}
          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 rounded-full ${isWatchLater ? "text-primary" : ""}`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          {/* Share */}
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full">
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>

          {/* ✅ Download Button */}
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full" onClick={handleDownload}>
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>

          <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>

        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>{video.description}</p>
        </div>

        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}>
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>

      {/* ✅ Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center space-y-4 shadow-xl w-[350px]">
            <h2 className="text-lg font-bold">Download Limit Reached</h2>
            <p className="text-gray-600 text-sm">
              Upgrade to <b>Premium</b> to download unlimited videos.
            </p>

            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={startRazorpayPayment}>
              Upgrade to Premium
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => setShowPremiumModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInfo;
