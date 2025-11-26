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

  // existing premium (unlimited downloads) modal
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // NEW: Plan upgrade modal (Bronze / Silver / Gold)
  const [showPlanModal, setShowPlanModal] = useState(false);
  // optional: show invoice url after purchase (local test path)
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

  // existing download handler (keeps behavior)
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
      alert("Failed to initialize payment");
    }
  };

  // -----------------------
  // NEW: Plan purchase (Bronze / Silver / Gold) Razorpay flow
  // -----------------------
  const startPlanPayment = async (selectedPlan: "bronze" | "silver" | "gold") => {
    if (!user) return alert("Please login to upgrade your plan");

    try {
      // create order for the selected plan
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
            // notify backend to verify and activate plan
            const successResp = await axiosInstance.post("/plan/success", {
              userId: user._id,
              plan: selectedPlan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (successResp.data?.success) {
              alert("✅ Plan Activated! Check your email for an invoice.");
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {(video?.videochanel && video.videochanel[0]) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4">Subscribe</Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Like/Dislike */}
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

          {/* Download */}
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full" onClick={handleDownload}>
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>

          {/* Upgrade Plan (NEW) */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-green-100 rounded-full"
            onClick={() => setShowPlanModal(true)}
          >
            Upgrade Plan
          </Button>

          <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{(video.views || 0).toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>

        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>{video.description}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>

      {/* Premium Modal (existing unlimited downloads flow) */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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

      {/* Plan Modal (Bronze / Silver / Gold) */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center space-y-4 shadow-xl w-[360px]">
            <h2 className="text-lg font-bold">Choose a Plan</h2>
            <p className="text-gray-600 text-sm">Upgrade your watch-time limit.</p>

            <div className="space-y-2">
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={() => startPlanPayment("bronze")}
              >
                Bronze — ₹10 (7 mins)
              </Button>

              <Button
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                onClick={() => startPlanPayment("silver")}
              >
                Silver — ₹50 (10 mins)
              </Button>

              <Button
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                onClick={() => startPlanPayment("gold")}
              >
                Gold — ₹100 (Unlimited)
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => setShowPlanModal(false)}>
              Cancel
            </Button>

            {/* show invoice/test file link for local testing */}
            {invoiceUrl && (
              <div className="mt-2 text-xs text-gray-500">
                Test invoice/file path:{" "}
                <a href={invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-600">
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
