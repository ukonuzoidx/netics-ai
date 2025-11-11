"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlusIcon } from "@radix-ui/react-icons";
import { Settings, Phone, Search, X } from "lucide-react";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useNavigation } from "@/lib/context/navigation";
import Image from "next/image";
import neticsAIM from "../public/netics_ai_main_logo.png";
import { useEffect } from "react";

export default function MobileNav() {
  const router = useRouter();
  const { isMobileNavOpen, closeMobileNav } = useNavigation();
  const chats = useQuery(api.chats.listChats);
  const createChat = useMutation(api.chats.createChat);
  // const deleteChat = useMutation(api.chats.deleteChat);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileNavOpen]);

  const handleNewChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    closeMobileNav();
    router.push(`/dashboard/chat/${chatId}`);
  };

  // const handleDeleteChat = async (id: Id<"chats">) => {
  //   await deleteChat({ id });
  //   if (window.location.pathname.includes(id)) {
  //     router.push("/dashboard");
  //   }
  // };

  if (!isMobileNavOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
        onClick={closeMobileNav}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 z-50 md:hidden overflow-y-auto animate-in slide-in-from-left duration-300">
        {/* Close button */}
        <button
          onClick={closeMobileNav}
          className="absolute right-4 top-4 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col h-full p-4 pt-12">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src={neticsAIM}
              alt="Netics AI"
              className="w-32 dark:[filter:brightness(0)_invert(1)]"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <PlusIcon className="h-5 w-5 text-neutral-900 dark:text-white" />
            <span className="text-sm text-neutral-900 dark:text-white">
              New Chat
            </span>
          </button>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
            />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-500 mb-2 px-2">
              Recent Chats
            </div>
            {chats?.slice(0, 10).map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                onNavigate={(chatId) => {
                  closeMobileNav();
                  router.push(`/dashboard/chat/${chatId}`);
                }}
              />
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <button
              onClick={() => {
                closeMobileNav();
                router.push("/dashboard/voice");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm">Voice Chat</span>
            </button>
            <button
              onClick={() => {
                closeMobileNav();
                router.push("/dashboard/settings");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ChatItem component to show last message
function ChatItem({
  chat,
  onNavigate,
}: {
  chat: Doc<"chats">;
  onNavigate: (chatId: Id<"chats">) => void;
}) {
  const lastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  });

  return (
    <button
      onClick={() => onNavigate(chat._id)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
    >
      <p className="truncate">
        {lastMessage
          ? lastMessage.content.substring(0, 35) +
            (lastMessage.content.length > 35 ? "..." : "")
          : "New conversation"}
      </p>
    </button>
  );
}
