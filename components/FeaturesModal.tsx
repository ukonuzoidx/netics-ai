"use client";

import {
  X,
  Calendar,
  Heart,
  Wallet,
  Home,
  BookOpen,
  MessageCircle,
  AlertCircle,
  Leaf,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currentFeatures = [
  {
    icon: Calendar,
    title: "Personal Assistant",
    description: "Schedules, reminders, and calendar management",
    status: "active",
  },
  {
    icon: MessageCircle,
    title: "AI Chat",
    description: "Intelligent conversations with voice support",
    status: "active",
  },
  {
    icon: Calendar,
    title: "Google Calendar Integration",
    description: "Sync and manage your Google Calendar events",
    status: "active",
  },
];

const comingSoonFeatures = [
  {
    icon: Heart,
    title: "Health & Wellness Monitoring",
    description: "Track your health metrics and wellness goals",
  },
  {
    icon: Wallet,
    title: "Financial Tracking",
    description: "Budget management and expense tracking",
  },
  {
    icon: Home,
    title: "Smart Home Integration",
    description: "Control your smart home devices",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Personal growth and skill development tools",
  },
  {
    icon: MessageCircle,
    title: "Virtual Companion",
    description: "Emotional support and companionship",
  },
  {
    icon: AlertCircle,
    title: "Emergency Response",
    description: "Quick access to emergency services",
  },
  {
    icon: Leaf,
    title: "Environmental Tracking",
    description: "Monitor your carbon footprint",
  },
];

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
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
                  Netics AI Features
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
                {/* Current Features */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Available Now
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentFeatures.map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <feature.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-white mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming Soon Features */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Coming Soon
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comingSoonFeatures.map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                            <feature.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-white mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase 2 - Humanoid */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Phase 2: AI Humanoid Assistant
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Our vision includes evolving into a physical humanoid
                    assistant offering:
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        •
                      </span>
                      <span>
                        Physical assistance (carrying groceries, cleaning,
                        elderly care)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        •
                      </span>
                      <span>
                        Advanced conversational abilities with emotional
                        intelligence
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        •
                      </span>
                      <span>Home security and monitoring capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        •
                      </span>
                      <span>
                        Proactive assistance based on learned behaviors
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
