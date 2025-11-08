import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {

  // ✅ Load Razorpay script globally
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <UserProvider>
      <div className="min-h-screen bg-white text-black">
        <title>Your-Tube Clone</title>
        <Header />
        <Toaster />

        <div className="flex">
          <Sidebar />
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}
