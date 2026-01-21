import {
  Bell,
  Menu,
  Mic,
  Search,
  User,
  VideoIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import OTPModal from "./OTPModal";
import PhoneModal from "./PhoneModal";

const SOUTH_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { user, logout, requestOTP } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [userState, setUserState] = useState("unknown");
  const [isWhiteTheme, setIsWhiteTheme] = useState(false);
  const [isSouth, setIsSouth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function detectTheme() {
      try {
        const res = await axios.get("https://ipapi.co/json/");
        const state = (res.data.region || "unknown").toLowerCase();
        setUserState(state);

        const south = SOUTH_STATES.includes(state);
        setIsSouth(south);

        const hour = new Date().getHours();
        const isTime = hour >= 10 && hour <= 12;

        const whiteTheme = south && isTime;
        setIsWhiteTheme(whiteTheme);

        if (whiteTheme) {
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
        }
      } catch (err) {
        console.log("Theme detection error:", err);
      }
    }

    detectTheme();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignInClick = async () => {
    if (isSouth) {
      const res = await requestOTP(userState, "");
      if (res.success) {
        alert(
          res.method === "email"
            ? "OTP sent to your email"
            : "OTP sent via voice call"
        );
        setOtpOpen(true);
      } else {
        alert("Failed to send OTP");
      }
    } else {
      setPhoneModalOpen(true);
    }
  };

  const handlePhoneSubmit = async (phone: string) => {
    const res = await requestOTP(userState, phone);
    if (res.success) {
      alert(
        res.method === "voice"
          ? "We will call your mobile with the OTP"
          : "OTP sent to your email"
      );
      setPhoneModalOpen(false);
      setOtpOpen(true);
    } else {
      alert("Failed to send OTP");
    }
  };

  return (
    <header
      className={`flex items-center justify-between px-3 sm:px-4 py-2 border-b
      ${isWhiteTheme ? "bg-white text-black" : "bg-background text-foreground"}`}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="hidden sm:block text-lg sm:text-xl font-medium">
            YourTube
          </span>
        </Link>
      </div>

      {/* SEARCH */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`rounded-l-full border-r-0 ${
              isWhiteTheme
                ? "bg-white text-black"
                : "bg-card text-foreground"
            }`}
          />
          <Button
            type="submit"
            className={`rounded-r-full px-4 sm:px-6 border border-l-0 ${
              isWhiteTheme
                ? "bg-gray-200 text-black"
                : "bg-muted text-foreground"
            }`}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <Button variant="ghost" size="icon">
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </form>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2">
        {user ? (
          <>
            <Button variant="ghost" size="icon">
              <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/channel/${user?._id}`}>Your Channel</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button className="flex items-center gap-2" onClick={handleSignInClick}>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        )}
      </div>

      <Channeldialogue
        isopen={dialogOpen}
        onclose={() => setDialogOpen(false)}
        mode="create"
      />
      <PhoneModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSubmit={handlePhoneSubmit}
      />
      <OTPModal isOpen={otpOpen} onClose={() => setOtpOpen(false)} />
    </header>
  );
};

export default Header;


