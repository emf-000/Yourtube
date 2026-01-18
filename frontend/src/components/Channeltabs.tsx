import React, { useState } from "react";
import { Button } from "./ui/button";

const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" },
];

const Channeltabs = () => {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="border-b px-2 sm:px-4">
      <div
        className="
          flex gap-4 sm:gap-8
          overflow-x-auto
          whitespace-nowrap
        "
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`px-0 py-3 sm:py-4 border-b-2 rounded-none text-sm sm:text-base ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Channeltabs;
