"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { User } from "lucide-react";

interface ChatHeaderProps {
  title?: string;
}

export function ChatHeader({ title = "Chat" }: ChatHeaderProps) {
  const { user } = useUser();

  return (
    <header className="h-14 border-b border-neutral-800 bg-black flex items-center justify-between px-6">
      <h1 className="text-sm font-medium text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            className="h-8 w-8 rounded-full ring-2 ring-neutral-700"
            width={32}
            height={32}
            alt="User Avatar"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <User className="h-4 w-4 text-neutral-400" />
          </div>
        )}
      </div>
    </header>
  );
}
