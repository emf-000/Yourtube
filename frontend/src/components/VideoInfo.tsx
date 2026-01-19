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

  useEffect(() => {
    const handleviews = async () => {
      if (!video?._id) return;
      try {
        if (user) {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user._id,
          });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
      } catch (err) {
        console.log("history error", err);
      }
    };
    handleviews();
  }, [user, video?._id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev) => prev - 1);
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
          setDislikes((prev) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev) => prev - 1);
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

      alert("Video added to Downloads");
    } catch (err) {
      console.log(err);
      alert("Download failed");
    }
  };

  // -----------------------
  // Existing Premium (unlimited downloads) Razorpay flow — unchanged
  // -----------------------
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
          if (!user) return alert("Please login to activate premium");
          await axiosInstance.post("/payment/success", { userId: user._id });
          alert(" Premium Activated! You can now download unlimited videos.");
          setShowPremiumModal(false);
        },

        theme: { color: "#FF0000" },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log(error);
      alert("Failed to initialize payment");
    }
  };

  // -----------------------
  // NEW: Plan purchase (Bronze / Silver / Gold) Razorpay flow
  // -----------------------
  const startPlanPayment = async (selectedPlan: "bronze" | "silver" | "gold") => {
    if (!user) return alert("Please login to upgrade your plan");

    try {
      const res = await axiosInstance.post("/plan/order", {
        plan: selectedPlan,
        userId: user._id,
      });

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: res.data.amount,
        currency: res.data.currency || "INR",
        name: "YourTube Plans",
        description: `${selectedPlan} plan`,
        order_id: res.data.id,

        handler: async function (response: any) {
          try {
            const successResp = await axiosInstance.post("/plan/success", {
              userId: user._id,
              plan: selectedPlan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (successResp.data?.success) {
              alert(" Plan Activated! Check your email for an invoice.");
              setInvoiceUrl("/mnt/data/Venice_5.mp4");
            } else {
              alert("Plan activation failed on server.");
            }
          } catch (err) {
            console.error("plan success error", err);
            alert("Plan activation failed");
          } finally {
            setShowPlanModal(false);
          }
        },

        prefill: {
          name: user.name || "",
          email: (user as any)?.email || "",
        },
        theme: { color: "#111827" },
      };

      // @ts-ignore
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("create plan order error", err);
      alert("Could not start payment");
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <h1 className="text-lg sm:text-xl font-semibold break-words">{video.videotitle}</h1>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {(video?.videochanel && video.videochanel[0]) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm sm:text-base">{video.videochanel}</h3>
              <p className="text-xs sm:text-sm text-gray-600">1.2M subscribers</p>
            </div>
          </div>
          <Button className="rounded-full h-9 sm:h-10 px-4 sm:px-6">Subscribe</Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap overflow-x-hidden">
          {/* Like/Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full shrink-0">
            <Button variant="ghost" size="sm" className="rounded-l-full" onClick={handleLike}>
              <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button variant="ghost" size="sm" className="rounded-r-full" onClick={handleDislike}>
              <ThumbsDown className={`w-5 h-5 ${isDisliked ? "fill-black text-black" : ""}`} />
            </Button>
          </div>

          <Button variant="secondary" size="sm" className="rounded-full shrink-0" onClick={() => setShowPlanModal(true)}>
             Upgrade Plan
          </Button>

          <Button variant="secondary" size="sm" className="rounded-full shrink-0">
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>

          <Button variant="secondary" size="sm" className="rounded-full shrink-0" onClick={handleDownload}>
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>

          <Button variant="secondary" size="sm" className="rounded-full shrink-0" onClick={handleWatchLater}>
            <Clock className={`w-5 h-5 mr-2 ${isWatchLater ? "text-blue-600 fill-blue-600" : ""}`} />
            Save
          </Button>

          <Button variant="secondary" size="icon" className="rounded-full shrink-0 h-9 w-9">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl p-3 text-sm">
        <div className="flex gap-2 font-semibold mb-1">
          <span>{video?.views?.toLocaleString()} views</span>
          <span>
            {video.createdAt && formatDistanceToNow(new Date(video.createdAt))} ago
          </span>
        </div>
        <p className={`${!showFullDescription && "line-clamp-2"} whitespace-pre-wrap`}>
          {video.videodescription}
        </p>
        <button
          onClick={() => setShowFullDescription(!showFullDescription)}
          className="mt-1 font-bold"
        >
          {showFullDescription ? "Show less" : "...more"}
        </button>
      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Upgrade to Premium</h2>
            <p className="mb-6 text-gray-600">Get unlimited downloads and more features.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={startRazorpayPayment}>Buy Premium</Button>
              <Button variant="ghost" onClick={() => setShowPremiumModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Choose a Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {['bronze', 'silver', 'gold'].map((plan) => (
                <div key={plan} className="border rounded-xl p-4 flex flex-col items-center">
                  <h3 className="capitalize font-bold mb-2">{plan}</h3>
                  <Button className="w-full mt-auto" onClick={() => startPlanPayment(plan as any)}>Upgrade</Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowPlanModal(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInfo;
