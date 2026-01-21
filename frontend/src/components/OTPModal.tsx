import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@/lib/AuthContext";

type OTPModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose }) => {
  const { verifyOTP } = useUser();
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  const handleVerify = async () => {
    const res = await verifyOTP(otp);

    if (res.success) {
      alert("OTP Verified!");
      onClose();
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-3">
      <div
        className="
          bg-white dark:bg-gray-900
          p-5 sm:p-6
          rounded-xl
          w-full max-w-xs sm:max-w-sm
        "
      >
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          Verify OTP
        </h2>

        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mb-3 text-sm sm:text-base"
        />

        <Button className="w-full text-sm sm:text-base" onClick={handleVerify}>
          Verify
        </Button>

        <Button
          variant="secondary"
          className="w-full mt-2 text-sm sm:text-base"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default OTPModal;
