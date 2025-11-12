"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import VoiceOrb from "./VoiceOrb";
import "./VoiceOrb.css";

export default function VoiceChat() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicPaused, setIsMicPaused] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const isCallActiveRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  const startCall = async () => {
    try {
      console.log("🎙️ Starting listening process...");
      setIsCallActive(true);
      setIsMicPaused(false);
      setConversation([]);
      conversationRef.current = [];
      await startRecordingProcess();
    } catch (error) {
      console.error("Failed to start call:", error);
      alert(
        "Could not access microphone. Please allow microphone permissions."
      );
    }
  };

  const endCall = () => {
    console.log("📞 Ending call...");
    setIsCallActive(false);
    setIsMicPaused(false);
    stopRecording();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsAiSpeaking(false);
  };

  const toggleMic = () => {
    if (isMicPaused) {
      console.log("🎤 Resuming microphone...");
      setIsMicPaused(false);
      startRecordingProcess();
    } else {
      console.log("⏸️ Pausing microphone...");
      setIsMicPaused(true);
      stopRecording();
    }
  };

  const startRecordingProcess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Set up audio analysis for actual silence detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("📦 Audio chunk received, size:", event.data.size);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🔇 Recording stopped...");
        setIsRecording(false);
        await handleSilence();
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("🎤 Recording started");

      // Start real-time audio level monitoring
      monitorAudioLevels();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const monitorAudioLevels = () => {
    if (!analyserRef.current || !isCallActiveRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!analyserRef.current || !isCallActiveRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);

      // Calculate volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const volume = Math.sqrt(sum / bufferLength);

      // INCREASED threshold to prevent false triggers from background noise
      // 0.02 is more realistic for actual speech vs ambient noise
      const isSpeaking = volume > 0.02;

      if (isSpeaking) {
        // User is speaking - reset the silence timer
        console.log("🎤 Speech detected, volume:", volume.toFixed(4));
        isSpeakingRef.current = true;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      } else if (isSpeakingRef.current) {
        // User stopped speaking - start silence timer
        console.log("🤫 Silence detected, waiting...");
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            console.log("⏱️ Silence timeout reached, stopping recording...");
            mediaRecorderRef.current.stop();
          }
        }, 2000); // 2 seconds of silence after speaking

        isSpeakingRef.current = false;
      }

      // Continue monitoring
      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  const handleSilence = async () => {
    console.log(
      "🔍 handleSilence called, audioChunks length:",
      audioChunksRef.current.length
    );

    if (!isCallActiveRef.current) {
      console.log("⚠️ Call ended, skipping processing");
      return;
    }

    if (audioChunksRef.current.length === 0) {
      console.log("⚠️ No audio chunks recorded, restarting...");
      if (isCallActiveRef.current) {
        await startRecordingProcess();
      }
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      console.log("🎵 Audio blob created, size:", audioBlob.size, "bytes");

      // REJECT if audio is too small - likely just background noise
      // WebM header is ~200-300 bytes, so anything under 5KB is probably noise
      if (audioBlob.size < 5000) {
        console.log(
          "⚠️ Audio too small (background noise), skipping transcription"
        );
        audioChunksRef.current = []; // Clear chunks
        if (isCallActiveRef.current) {
          await startRecordingProcess();
        }
        return;
      }

      const message = await transcribeAudio(audioBlob);
      console.log("📝 Transcription:", message);

      // ALSO check if transcription is meaningful (not just noise/silence)
      if (message && message.trim() && message.trim().length > 2) {
        setCurrentTranscript(message);

        console.log("🎯 Processing user message...");

        const userMessage = { role: "user" as const, text: message };
        setConversation((prev) => [...prev, userMessage]);
        conversationRef.current.push({ role: "user", content: message });

        console.log("🤖 Getting AI response...");
        const responseText = await getAIResponse(message);
        console.log(
          "📄 AI response text:",
          responseText.substring(0, 100) + "..."
        );

        const aiMessage = { role: "assistant" as const, text: responseText };
        setConversation((prev) => [...prev, aiMessage]);
        conversationRef.current.push({
          role: "assistant",
          content: responseText,
        });

        console.log("🎤 Converting AI response to audio...");
        try {
          await convertResponseToAudio(responseText);
          console.log("✅ Audio playback completed successfully");
        } catch (ttsError) {
          console.error("❌ TTS/Audio playback failed:", ttsError);
          // Continue even if TTS fails - don't block the flow
        }
      } else {
        console.log("⚠️ Transcription empty or too short, ignoring");
      }
    } catch (error) {
      console.error("❌ Error handling silence:", error);
    } finally {
      console.log("🔄 Restarting recording...");
      if (isCallActiveRef.current) {
        try {
          await startRecordingProcess();
          console.log("✅ Recording restarted successfully");
        } catch (restartError) {
          console.error("❌ Error restarting recording:", restartError);
        }
      }
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    console.log("📝 Transcribing audio... blob size:", audioBlob.size);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("📡 Transcribe API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Transcription failed:", errorText);
        throw new Error("Transcription failed: " + errorText);
      }

      const data = await response.json();
      console.log("✅ Transcription result:", data);
      return data.text;
    } catch (error) {
      console.error("❌ Transcription error:", error);
      throw error;
    }
  };

  const getAIResponse = async (message: string): Promise<string> => {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationRef.current.slice(0, -1),
        newMessage: message,
      }),
    });

    if (!response.ok) {
      throw new Error("AI response failed");
    }

    const reader = response.body?.getReader();
    let aiResponse = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token" && data.token) {
                aiResponse += data.token;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    console.log("✅ AI Response:", aiResponse);

    if (!aiResponse.trim()) {
      console.warn("⚠️ Empty AI response, using fallback");
      return "I'm sorry, I didn't get a response. Please try again.";
    }

    return aiResponse;
  };

  const convertResponseToAudio = async (text: string) => {
    console.log("🔊 Converting response to audio...");
    setIsAiSpeaking(true);

    try {
      // Clean markdown formatting for natural speech
      const cleanText = text
        // Remove code blocks
        .replace(/---START---[\s\S]*?---END---/g, "")
        .replace(/```[\s\S]*?```/g, "")
        // Remove headers (#)
        .replace(/#{1,6}\s/g, "")
        // Remove bold/italic
        .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        // Remove HTML tags
        .replace(/<[^>]+>/g, "")
        // Remove inline code
        .replace(/`([^`]+)`/g, "$1")
        // Remove numbered lists (1. 2. 3.)
        .replace(/^\d+\.\s+/gm, "")
        // Remove bullet points (- or *)
        .replace(/^[\-\*]\s+/gm, "")
        // Replace multiple newlines with period and space for better speech flow
        .replace(/\n\n+/g, ". ")
        // Replace single newlines with space
        .replace(/\n/g, " ")
        // Remove multiple spaces
        .replace(/\s+/g, " ")
        .trim();

      console.log(
        "🧹 Cleaned text for TTS:",
        cleanText.substring(0, 100) + "..."
      );

      if (!cleanText) {
        setIsAiSpeaking(false);
        return;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      console.log("📡 TTS API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ TTS API failed:", response.status, errorText);
        setIsAiSpeaking(false);
        throw new Error(`TTS failed: ${response.status} - ${errorText}`);
      }

      // Check if response is JSON (browser TTS fallback signal)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.useBrowserTTS) {
          console.log("🎙️ Using browser's Web Speech API as fallback...");

          // Use browser's native speech synthesis
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          await new Promise<void>((resolve, reject) => {
            utterance.onend = () => {
              console.log("✅ Browser TTS playback finished");
              setIsAiSpeaking(false);
              resolve();
            };

            utterance.onerror = (error) => {
              console.error("❌ Browser TTS error:", error);
              setIsAiSpeaking(false);
              reject(error);
            };

            window.speechSynthesis.speak(utterance);
          });

          return;
        }
      }

      const audioBlob = await response.blob();
      console.log("🎵 Audio blob received, size:", audioBlob.size, "bytes");

      if (audioBlob.size < 100) {
        console.error("❌ Audio blob too small, likely error");
        setIsAiSpeaking(false);
        throw new Error("Audio blob too small");
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          console.log("✅ Playback finished");
          setIsAiSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          console.error("❌ Audio playback error", error);
          console.error("Audio element error details:", audio.error);
          setIsAiSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(
            new Error(
              `Audio playback failed: ${
                audio.error?.message || "Unknown error"
              }`
            )
          );
        };

        console.log("🔊 Starting audio playback...");
        audio.play().catch((playError) => {
          console.error("❌ audio.play() failed:", playError);
          reject(playError);
        });
      });

      console.log("🎵 Audio playback complete");
    } catch (error) {
      console.error("❌ TTS error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      setIsAiSpeaking(false);
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl w-full space-y-8">
        {/* Voice Orb - Only shown when call is active */}
        {isCallActive && (
          <div className="flex justify-center">
            <VoiceOrb
              isListening={isRecording && !isMicPaused && !isAiSpeaking}
            />
          </div>
        )}

        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              {isCallActive ? "Voice Chat Active" : "Voice Chat"}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isCallActive
                ? isAiSpeaking
                  ? "AI is speaking..."
                  : isMicPaused
                  ? "Microphone paused - click to resume"
                  : isRecording
                  ? "Listening to you..."
                  : "Processing..."
                : "Start a voice conversation with AI"}
            </p>
            {currentTranscript && !isAiSpeaking && (
              <p className="text-sm text-neutral-500 dark:text-neutral-500 italic">
                Last: &quot;{currentTranscript}&quot;
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-full shadow-lg"
            >
              <Phone className="w-6 h-6 mr-2" />
              Start Voice Chat
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMic}
                className={`${
                  isMicPaused
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-8 py-6 text-lg rounded-full shadow-lg`}
              >
                {isMicPaused ? (
                  <>
                    <Mic className="w-6 h-6 mr-2" />
                    Resume Mic
                  </>
                ) : (
                  <>
                    <MicOff className="w-6 h-6 mr-2" />
                    Pause Mic
                  </>
                )}
              </Button>
              <Button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-full shadow-lg"
              >
                <PhoneOff className="w-6 h-6 mr-2" />
                End Call
              </Button>
            </>
          )}
        </div>

        {isCallActive && conversation.length > 0 && (
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-6 max-h-96 overflow-y-auto space-y-4">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
              Conversation
            </h3>
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCallActive && (
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-6 space-y-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              How it works:
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">●</span>
                Click &quot;Start Voice Chat&quot; to begin
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">●</span>
                Speak naturally - AI responds to everything you say
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">●</span>
                Pause for 2 seconds when you&apos;re done speaking
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">●</span>
                Click &quot;Pause Mic&quot; when typing or not speaking to avoid
                false triggers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">●</span>
                AI will respond with voice automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">●</span>
                Click &quot;End Call&quot; when you&apos;re done
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
