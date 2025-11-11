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
      <div className="flex h-screen w-full bg-white dark:bg-neutral-950">
        <Authenticated>
          <div className="hidden md:block">
            <DashboardSidebar />
          </div>
          <MobileNav />
        </Authenticated>

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Header />
          <main className="flex-1 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            {children}
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}
