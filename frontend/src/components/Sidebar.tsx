import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Video,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  const handleClick = () => {
    if (onClose) onClose();
  };

  return (
    <nav className="space-y-1 p-2 ">
      <Link href="/" onClick={handleClick}>
        <Button variant="ghost" className="w-full justify-start">
          <Home className="w-5 h-5 mr-3" />
          Home
        </Button>
      </Link>

      <Link href="/explore" onClick={handleClick}>
        <Button variant="ghost" className="w-full justify-start">
          <Compass className="w-5 h-5 mr-3" />
          Explore
        </Button>
      </Link>

      <Link href="/subscriptions" onClick={handleClick}>
        <Button variant="ghost" className="w-full justify-start">
          <PlaySquare className="w-5 h-5 mr-3" />
          Subscriptions
        </Button>
      </Link>

      {user && (
        <div className="border-t pt-2 mt-2">
          <Link href="/history" onClick={handleClick}>
            <Button variant="ghost" className="w-full justify-start">
              <History className="w-5 h-5 mr-3" />
              History
            </Button>
          </Link>

          <Link href="/liked" onClick={handleClick}>
            <Button variant="ghost" className="w-full justify-start">
              <ThumbsUp className="w-5 h-5 mr-3" />
              Liked videos
            </Button>
          </Link>

          <Link href="/watch-later" onClick={handleClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="w-5 h-5 mr-3" />
              Watch later
            </Button>
          </Link>

          <Link href="/downloads" onClick={handleClick}>
            <Button variant="ghost" className="w-full justify-start">
              <PlaySquare className="w-5 h-5 mr-3" />
              Downloads
            </Button>
          </Link>

          {user?.channelname ? (
            <Link href={`/channel/${user.id}`} onClick={handleClick}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-5 h-5 mr-3" />
                Your channel
              </Button>
            </Link>
          ) : (
            <div className="px-2 py-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setisdialogeopen(true)}
              >
                Create Channel
              </Button>
            </div>
          )}
        </div>
      )}

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </nav>
  );
};

export default Sidebar;
