"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useNavigation } from "@/lib/context/navigation";

export default function Header() {
  const { setIsMobileNavOpen } = useNavigation();

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          >
            <HamburgerMenuIcon className="h-5 w-5" />
          </Button>
          <div className="font-semibold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Chat with Netics AI
          </div>
        </div>
        <div className="flex items-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 ring-2 ring-neutral-700/50 ring-offset-2 ring-offset-neutral-900 rounded-full transition-shadow hover:ring-neutral-600/50",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
