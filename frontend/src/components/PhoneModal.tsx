import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type PhoneModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
};

const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-3">Enter Phone Number</h2>

        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit number"
          className="mb-3"
        />

        <Button className="w-full" onClick={() => onSubmit(phone)}>
          Continue
        </Button>

        <Button variant="secondary" className="w-full mt-2" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PhoneModal;
