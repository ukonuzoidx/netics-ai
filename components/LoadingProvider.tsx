"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoaderOne } from "@/components/ui/loader";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  initialLoadDuration?: number; // Duration in milliseconds
}

export function LoadingProvider({ 
  children, 
  initialLoadDuration = 6000 
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show loader for specified duration
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Small delay before showing content for smoother transition
      setTimeout(() => setShowContent(true), 200);
    }, initialLoadDuration);

    return () => clearTimeout(timer);
  }, [initialLoadDuration]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900"
          >
            <div className="flex flex-col items-center gap-6">
              <LoaderOne />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Netics AI
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Initializing your AI assistant...
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : showContent ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}
