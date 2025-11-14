"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlusIcon } from "@radix-ui/react-icons";
import { Settings, Phone } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { useState } from "react";
import Image from "next/image";
import neticsAIM from "../public/netics_ai_main_logo.png";
import neticsAIsm from "../public/NeticsAISmall.png";

export default function DashboardSidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const chats = useQuery(api.chats.listChats);
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handleNewChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    router.push(`/dashboard/chat/${chatId}`);
  };

  const handleDeleteChat = async (id: Id<"chats">) => {
    await deleteChat({ id });
    if (window.location.pathname.includes(id)) {
      router.push("/dashboard");
    }
  };

  // Filter chats based on search query
  // const filteredChats =
  //   chats?.filter((chat) =>
  //     chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  //   ) || [];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-0 bg-white/50 dark:bg-black/40 backdrop-blur-2xl border-r border-white/30 dark:border-white/10 shadow-xl">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          {open ? <Logo /> : <LogoIcon />}

          {/* New Chat Button */}
          <div className="mt-6">
            {/* <button
              onClick={handleNewChat}
              className={cn(
                " flex items-center py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-900 transition-colors",
                // open ? "px-4 justify-center" : "justify-center"
                // when open, add padding x 4, else reduce the width and center
                open ? " w-full px-4 justify-center gap-2" : "justify-center"
              )}
            >
              <PlusIcon className="h-5 w-5 text-white shrink-0" />
              {open && <span className="text-sm text-white">New Chat</span>}
            </button> */}
            {open ? (
              <button
                onClick={handleNewChat}
                className={cn(
                  "w-full px-4 justify-center gap-2 flex items-center py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg"
                )}
              >
                <PlusIcon className="h-5 w-5 text-neutral-900 dark:text-white shrink-0" />
                {open && (
                  <span className="text-sm text-neutral-900 dark:text-white font-medium">
                    New Chat
                  </span>
                )}
              </button>
            ) : (
              <button className="w-7 flex items-center justify-center py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg">
                <PlusIcon className="h-3 w-3 text-neutral-900 dark:text-white shrink-0" />
              </button>
            )}
          </div>

          {/* Search */}
          {/* <div className="mt-4 px-3">
            {open ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 z-10" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-white/50 transition-all shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center py-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg"
              >
                <Search className="h-5 w-5 text-neutral-900 dark:text-white shrink-0" />
              </button>
            )}
          </div> */}

          {/* Voice Chat */}
          <div className="mt-4 px-3">
            <button
              onClick={() => router.push("/dashboard/voice")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-2xl dark:hover:bg-white/20 transition-all shadow-lg",
                !open
                  ? "justify-center px-0"
                  : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
              )}
            >
              <Phone className="h-5 w-5 text-neutral-900 dark:text-white shrink-0" />
              {open && (
                <span className="text-sm text-neutral-900 dark:text-white">
                  Voice Chat
                </span>
              )}
            </button>
          </div>

          {/* Recent Chats Section */}
          {open && (
            <div className="mt-6 flex-1 overflow-y-auto px-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Recent Chats
                </p>
                <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
              <div className="space-y-0.5">
                {chats && chats.length > 0 ? (
                  chats
                    .slice(0, 10)
                    .map((chat) => (
                      <ChatRow
                        key={chat._id}
                        chat={chat}
                        onDelete={handleDeleteChat}
                        router={router}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-sm text-neutral-500 dark:text-neutral-400">
                    No chats yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings at bottom */}
        <div className="px-3 pb-4">
          <button
            onClick={() => router.push("/dashboard/settings")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg",
              !open && "justify-center px-0"
            )}
          >
            <Settings className="h-5 w-5 text-neutral-900 dark:text-white shrink-0" />
            {open && (
              <span className="text-sm text-neutral-900 dark:text-white font-medium">
                Settings
              </span>
            )}
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

const Logo = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center justify-center px-3 py-4"
    >
      <Image
        src={neticsAIM}
        alt="Netics AI"
        className="w-full h-20 dark:[filter:brightness(0)_invert(1)]"
      />
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center justify-center py-4"
    >
      <Image src={neticsAIsm} alt="Netics AI" className="w-8 h-8" />
    </a>
  );
};

function ChatRow({
  chat,
  onDelete,
  router,
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const lastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  });

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
  };

  return (
    <div
      className="group rounded-lg px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Last Message Preview Only */}
          <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
            {lastMessage
              ? lastMessage.content.substring(0, 50) +
                (lastMessage.content.length > 50 ? "..." : "")
              : "No messages yet"}
          </p>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat._id);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
