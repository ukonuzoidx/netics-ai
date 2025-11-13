"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { userId } = useAuth();
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is signed in with Google through Clerk
  useEffect(() => {
    const checkGoogleAuth = async () => {
      if (!userId) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch("/api/calendar/token");
        const data = await response.json();
        setHasGoogleAuth(data.hasAccess);
      } catch (error) {
        console.error("Error checking Google auth:", error);
        setHasGoogleAuth(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkGoogleAuth();
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage your connected accounts and preferences
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Connected Accounts
        </h2>

        <div className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Google Calendar
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Schedule meetings, check availability, manage events
                </p>
                {checkingAuth ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    Checking connection...
                  </p>
                ) : hasGoogleAuth ? (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected via Google Sign-In
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Sign in with Google to enable Calendar
                  </p>
                )}
              </div>
            </div>
            {hasGoogleAuth ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-900 bg-green-50 dark:bg-green-950/30"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Active
              </Button>
            ) : (
              <Button
                onClick={() => {
                  alert(
                    "To enable Google Calendar:\n\n1. Sign out\n2. Sign in with Google\n3. Grant Calendar permissions when prompted\n\nThen your Calendar will be automatically connected!"
                  );
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                How to Enable
              </Button>
            )}
          </div>

          {/* Coming Soon Integrations */}
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 opacity-75">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                <Calendar className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 dark:text-neutral-300">
                  Microsoft Outlook
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  Coming soon - Outlook calendar integration
                </p>
              </div>
            </div>
            <Button disabled variant="outline" size="sm">
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 opacity-75">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                <svg
                  className="w-6 h-6 text-neutral-400 dark:text-neutral-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 dark:text-neutral-300">
                  Plaid Banking
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
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

      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Preferences
        </h2>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Coming Soon:</strong> Customize your AI assistant with
            preferences for language, timezone, notification settings, and more.
          </p>
        </div>
      </section>
    </div>
  );
}
