"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface SpeakingContextType {
  isSpeaking: boolean;
  startSpeaking: () => void;
  stopSpeaking: () => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const SpeakingContext = createContext<SpeakingContextType | undefined>(
  undefined
);

export function SpeakingProvider({ children }: { children: React.ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startSpeaking = () => {
    console.log("🎤 AI Speaking started - isSpeaking:", true);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    console.log("🎤 AI Speaking ended - isSpeaking:", false);
    setIsSpeaking(false);
    // Don't pause here - let the component handle it to avoid race conditions
  };

  return (
    <SpeakingContext.Provider
      value={{ isSpeaking, startSpeaking, stopSpeaking, audioRef }}
    >
      {children}
    </SpeakingContext.Provider>
  );
}

export function useSpeaking() {
  const context = useContext(SpeakingContext);
  if (context === undefined) {
    throw new Error("useSpeaking must be used within a SpeakingProvider");
  }
  return context;
}
