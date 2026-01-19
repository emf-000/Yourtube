import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <UserProvider>
      <div className="h-screen overflow-hidden bg-white text-black flex flex-col">
        <title>Your-Tube Clone</title>

        {/* HEADER */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Toaster />

        {/* LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <aside
            className={`
              fixed md:static z-50
              w-64 h-full bg-white
              transform transition-transform duration-300
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
            `}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />

          </aside>

          {/* MAIN CONTENT (ONLY SCROLL AREA) */}
          <main className="flex-1 overflow-y-auto">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
