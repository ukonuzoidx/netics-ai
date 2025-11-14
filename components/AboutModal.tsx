"use client";

import { X, Target, Users, MapPin, TrendingUp, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  // Get user statistics
//   const chats = useQuery(api.chats.listChats);
//   const totalChats = chats?.length || 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  About Netics AI
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                    Overview
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    NETICS AI is an all-in-one AI personal assistant platform
                    being developed by Lognetics, designed to evolve from a
                    mobile app into a physical humanoid assistant. We&apos;re
                    transforming how people manage their daily lives by
                    consolidating multiple apps into one intelligent system.
                  </p>
                </div>

                {/* The Problem */}
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                    The Problem We&apos;re Solving
                  </h3>
                  <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-1">
                        •
                      </span>
                      <span>
                        People juggle multiple apps for daily tasks, creating
                        inefficiencies
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-1">
                        •
                      </span>
                      <span>
                        Need for an intelligent system that proactively learns
                        and improves quality of life
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-1">
                        •
                      </span>
                      <span>
                        Managing personal and professional life is increasingly
                        challenging
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Market Opportunity */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Market Opportunity
                  </h3>
                  <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                      AI personal assistant market projected to reach $100
                      billion by 2030
                    </p>
                    <p>Growing at 31.2% annually</p>
                    <p className="text-sm">
                      <strong>Target Markets:</strong> Busy professionals,
                      elderly/disabled individuals, and families seeking smart
                      home solutions
                    </p>
                  </div>
                </div>

                {/* Our Progress */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Our Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        1000+
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total Conversations
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        Active
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Platform Status
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-3">
                    Join our growing community of AI-powered productivity
                  </p>
                </div>

                {/* Team */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                    Our Team
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        Light Ihesiulo
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Founder/CEO - AI Development & Strategy
                      </p>
                    </div>
                    <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        Joy Ojo
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        CTO - AI Engineering
                      </p>
                    </div>
                    <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        Amaka Austa
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Head of Product
                      </p>
                    </div>
                    <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        Philip Chinemerem
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Advisory Board
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="w-5 h-5" />
                  <span>Lognetics Hub, Abuja, Nigeria</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
