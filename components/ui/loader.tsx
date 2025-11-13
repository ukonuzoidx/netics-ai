import React from "react";
import { motion } from "motion/react";

export function LoaderOne() {
  return (
    <div className="relative h-24 w-24">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Middle rotating ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-cyan-500/30 border-t-cyan-500"
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner pulsing circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
