"use client";
import React, { useRef } from "react";
import { motion } from "motion/react";

export const TextGradientEffect = ({
  text,
  // duration,
}: {
  text: string;
  // duration?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        <linearGradient
          id="textGradientAlwaysOn"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="75%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <motion.radialGradient
          id="revealMaskAlwaysOn"
          gradientUnits="userSpaceOnUse"
          r="60%"
          animate={{
            cx: ["20%", "80%", "50%", "20%"],
            cy: ["30%", "70%", "50%", "30%"],
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="50%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMaskAlwaysOn">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMaskAlwaysOn)"
          />
        </mask>
      </defs>

      {/* Background text with stroke - always visible */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
        style={{ opacity: 0.7 }}
      >
        {text}
      </text>

      {/* Animated stroke text */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>

      {/* Gradient text with mask - always visible */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradientAlwaysOn)"
        strokeWidth="0.4"
        mask="url(#textMaskAlwaysOn)"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  );
};
