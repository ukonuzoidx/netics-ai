"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";
import Header from "@/components/Header";
import { NavigationProvider } from "@/lib/context/navigation";
import { Authenticated } from "convex/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <div className="relative flex h-screen w-full overflow-hidden ">
        {/* Soft gradient blobs for iOS-style glass effect - stronger for light mode */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-300/50 dark:bg-purple-600/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-pink-300/50 dark:bg-pink-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-orange-300/40 dark:bg-blue-600/15 blur-3xl" />
        </div>

        <Authenticated>
          <div className="hidden md:block">
            <DashboardSidebar />
          </div>
          <MobileNav />
        </Authenticated>

        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </NavigationProvider>
  );
}
