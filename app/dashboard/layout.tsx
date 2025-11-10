"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
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
      <div className="flex h-screen overflow-hidden bg-neutral-950 dark:bg-neutral-950">
        <Authenticated>
          <DashboardSidebar />
        </Authenticated>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
            {children}
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}
