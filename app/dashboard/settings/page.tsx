"use client";

import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Calendar, X } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { userId } = useAuth();
  const integrations = useQuery(api.integrations.list, {
    userId: userId || "",
  });
  const removeIntegration = useMutation(api.integrations.remove);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleDisconnect = async (service: string) => {
    if (!userId) return;
    setRemoving(service);
    try {
      await removeIntegration({ userId, service });
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setRemoving(null);
    }
  };

  const hasGoogleCalendar = integrations?.some((i) => i.service === "google");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-100">Settings</h1>
        <p className="text-neutral-400 mt-2">
          Manage your connected accounts and preferences
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-neutral-100">
          Connected Accounts
        </h2>

        <div className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-950 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-100">
                  Google Calendar
                </h3>
                <p className="text-sm text-neutral-400">
                  Schedule meetings, check availability, manage events
                </p>
                {hasGoogleCalendar && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </p>
                )}
              </div>
            </div>
            {hasGoogleCalendar ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect("google")}
                disabled={removing === "google"}
                className="text-red-400 hover:text-red-300 hover:bg-red-950 border-neutral-700"
              >
                <X className="w-4 h-4 mr-1" />
                {removing === "google" ? "Disconnecting..." : "Disconnect"}
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/api/auth/google")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect
              </Button>
            )}
          </div>

          {/* Coming Soon Integrations */}
          <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-900/50 opacity-75">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <Calendar className="w-6 h-6 text-neutral-500" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-300">
                  Microsoft Outlook
                </h3>
                <p className="text-sm text-neutral-500">
                  Coming soon - Outlook calendar integration
                </p>
              </div>
            </div>
            <Button disabled variant="outline" size="sm">
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-900/50 opacity-75">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <svg
                  className="w-6 h-6 text-neutral-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-300">Plaid Banking</h3>
                <p className="text-sm text-neutral-500">
                  Coming soon - Track expenses and budgets
                </p>
              </div>
            </div>
            <Button disabled variant="outline" size="sm">
              Coming Soon
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-neutral-100">
          Preferences
        </h2>
        <div className="bg-blue-950 border border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Coming Soon:</strong> Customize your AI assistant with
            preferences for language, timezone, notification settings, and more.
          </p>
        </div>
      </section>
    </div>
  );
}
