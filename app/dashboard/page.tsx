"use client";

import { BotIcon } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const router = useRouter();
  const createChat = useMutation(api.chats.createChat);

  // Check for pending message from landing page
  useEffect(() => {
    const checkPendingMessage = async () => {
      const pendingMessage = localStorage.getItem("pendingChatMessage");
      const fromLandingPage = localStorage.getItem("fromLandingPageInput");

      if (pendingMessage && fromLandingPage === "true") {
        console.log("📝 Found pending message, creating chat:", pendingMessage);
        try {
          const chatId = await createChat({
            title: pendingMessage.slice(0, 50),
          });
          console.log("✅ Chat created, navigating to:", chatId);
          // Keep message and flag in localStorage for ChatInterface to send it
          router.push(`/dashboard/chat/${chatId}`);
        } catch (error) {
          console.error("❌ Error creating chat after sign-in:", error);
          localStorage.removeItem("pendingChatMessage");
          localStorage.removeItem("fromLandingPageInput");
        }
      }
    };

    checkPendingMessage();
  }, [createChat, router]);

  return (
    <div className="relative flex-1 flex items-center justify-center p-4 h-full overflow-hidden">
      {/* Colorful gradient background - stronger for light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-200 to-indigo-200 dark:from-violet-600/60 dark:via-purple-600/40 dark:to-fuchsia-600/40 opacity-50" />

      <div className="relative max-w-2xl w-full group">
        {/* Decorative blur - stronger colors for light mode */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-orange-400/50 dark:from-purple-500/40 dark:via-pink-500/40 dark:to-orange-500/40 rounded-3xl blur-2xl opacity-70 group-hover:opacity-90 transition-opacity"></div>

        <div className="relative space-y-6 p-8 text-center">
          <div className="bg-white/30 dark:bg-white/10 backdrop-blur-md shadow-2xl ring-1 ring-white/30 dark:ring-white/20 rounded-3xl p-8 space-y-4">
            <div className="bg-gradient-to-br from-purple-400/40 via-pink-400/40 to-orange-400/40 dark:from-purple-500/30 dark:via-pink-500/30 dark:to-orange-500/30 backdrop-blur-md rounded-2xl p-5 inline-flex ring-1 ring-white/30 dark:ring-white/20 shadow-2xl">
              <BotIcon className="w-12 h-12 text-purple-600 dark:text-neutral-300" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-br from-neutral-500 to-neutral-500 dark:bg-gradient-to-br dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              {/* <h2 className="text-2xl font-semibold bg-gradient-to-br from-neutral-100 to-neutral-400 bg-clip-text text-transparent"> */}
              Welcome to Netics AI
            </h2>
            <p className="dark:text-neutral-400 text-neutral-600 max-w-md mx-auto">
              Your all-in-one AI assistant. Start a conversation to unlock
              productivity, research, scheduling, and more.
            </p>
            <div className="pt-2 flex justify-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Real-time responses
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Smart assistance
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Powerful tools
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
