"use client";

import { useEffect, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import WelcomeMessage from "@/components/WelcomeMessage";
import { createSSEParser } from "@/lib/SSEParser";
import { MessageBubble } from "@/components/MessageBubble";
import { ArrowRight, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { SpeakingProvider, useSpeaking } from "@/lib/context/speaking";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

function ChatInterfaceInner({ chatId, initialMessages }: ChatInterfaceProps) {
  const { isSpeaking, startSpeaking, stopSpeaking, audioRef } = useSpeaking();
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const [isToolExecuting, setIsToolExecuting] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSentPendingMessage = useRef(false);

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Check for pending message from landing page
  useEffect(() => {
    if (hasSentPendingMessage.current) return;

    const pendingMessage = localStorage.getItem("pendingChatMessage");
    const fromLandingPage = localStorage.getItem("fromLandingPageInput");

    if (
      pendingMessage &&
      fromLandingPage === "true" &&
      messages.length === 0 &&
      !isLoading
    ) {
      // Only auto-send if this is a new chat with no messages AND user came from landing page
      setInput(pendingMessage);
      localStorage.removeItem("pendingChatMessage");
      localStorage.removeItem("fromLandingPageInput");
      hasSentPendingMessage.current = true;

      // Auto-submit the message after a brief delay
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 500);
    }
  }, [messages.length, isLoading]);

  // Start/stop voice recording
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  };

  // Commented out - not currently used in production
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatTerminalOutput = (
    tool: string,
    input: unknown,
    output: unknown
  ) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
      <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
        <span class="text-red-500">●</span>
        <span class="text-yellow-500">●</span>
        <span class="text-green-500">●</span>
        <span class="text-gray-400 ml-1 text-sm">~/Searching </span>
      </div>
      <div class="text-gray-400 mt-1">$ Input</div>
      <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(
        input
      )}</pre>
      <div class="text-gray-400 mt-2">$ Output</div>
      <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(
        output
      )}</pre>
    </div>`;

    return `---START---\n${terminalHtml}\n---END---`;
  };

  // Text-to-speech function
  const speakText = async (text: string) => {
    if (!text || isSpeaking) return;

    // Clean the text - remove markdown, HTML, and special markers
    const cleanText = text
      .replace(/---START---[\s\S]*?---END---/g, "") // Remove terminal output
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\*/g, "") // Remove italics
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links but keep text
      .replace(/<[^>]+>/g, "") // Remove HTML tags
      .replace(/`/g, "") // Remove code markers
      .trim();

    if (!cleanText || cleanText.length < 3) return;

    console.log(
      "🎤 Starting TTS for text:",
      cleanText.substring(0, 50) + "..."
    );

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) {
        console.error("TTS failed:", await response.text());
        return;
      }

      const audioBlob = await response.blob();
      console.log("🎵 Audio blob received, size:", audioBlob.size, "bytes");

      if (audioBlob.size < 100) {
        console.error("❌ Audio too small, likely empty");
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any currently playing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event handlers BEFORE starting to speak
      audio.onloadedmetadata = () => {
        console.log("🎵 Audio loaded, duration:", audio.duration, "seconds");
      };

      audio.onended = () => {
        console.log("✅ Audio playback ended naturally");
        stopSpeaking();
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error("❌ Audio playback error:", e);
        stopSpeaking();
        URL.revokeObjectURL(audioUrl);
      };

      // Start speaking state and play audio
      startSpeaking();
      console.log("🎤 Speaking state started, now playing audio...");

      // Wait a tiny bit for state to update before playing
      await new Promise((resolve) => setTimeout(resolve, 50));

      await audio.play().catch((err) => {
        console.error("❌ Play error:", err);
        stopSpeaking();
        URL.revokeObjectURL(audioUrl);
      });

      console.log("✅ Audio play() called successfully");
    } catch (error) {
      console.error("❌ Text-to-speech error:", error);
      stopSpeaking();
    }
  };

  const handleStopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSpeaking();
  };

  /**
   * Processes a ReadableStream from the SSE response.
   * This function continuously reads chunks of data from the stream until it's done.
   * Each chunk is decoded from Uint8Array to string and passed to the callback.
   */
  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Reset UI state for new message
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsToolExecuting(false);
    setIsLoading(true);

    // Add user's message immediately for better UX
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    setMessages((prev) => [...prev, optimisticUserMessage]);

    // Track complete response for saving to database
    let fullResponse = "";

    try {
      // Prepare chat history and new message for API
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newMessage: trimmedInput,
        chatId,
      };

      // Initialize SSE connection
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body available");

      // Create SSE parser and stream reader
      const parser = createSSEParser();
      const reader = response.body.getReader();

      // Process the stream chunks
      await processStream(reader, async (chunk) => {
        // Parse SSE messages from the chunk
        const messages = parser.parse(chunk);

        console.log("Parsed SSE messages:", messages);

        // Handle each message based on its type
        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              // Handle streaming tokens (normal text response)
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolStart:
              // Handle start of tool execution (e.g. API calls, file operations)
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });
                setIsToolExecuting(true);
                // fullResponse += formatTerminalOutput(
                //   message.tool,
                //   message.input,
                //   "Processing..."
                // );
                // setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolEnd:
              // Handle completion of tool execution
              if ("tool" in message && currentTool) {
                // Add line breaks after tool execution for better readability
                fullResponse += "\n\n";
                setStreamedResponse(fullResponse);
                setCurrentTool(null);
                setIsToolExecuting(false);
                // Tool execution complete, continue with normal streaming
              }
              break;

            case StreamMessageType.Error:
              // Handle error messages from the stream
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;

            case StreamMessageType.Done:
              // Handle completion of the entire response
              const assistantMessage: Doc<"messages"> = {
                _id: `temp_assistant_${Date.now()}`,
                chatId,
                content: fullResponse,
                role: "assistant",
                createdAt: Date.now(),
              } as Doc<"messages">;

              // Save the complete message to the database
              const convex = getConvexClient();
              await convex.mutation(api.messages.store, {
                chatId,
                content: fullResponse,
                role: "assistant",
              });

              setMessages((prev) => [...prev, assistantMessage]);
              setStreamedResponse("");
              setIsToolExecuting(false);

              // Auto-speak the response if enabled
              if (autoSpeak && fullResponse) {
                await speakText(fullResponse);
              }

              return;
          }
        }
      });
    } catch (error) {
      // Handle any errors during streaming
      console.error("Error sending message:", error);
      // Remove the optimistic user message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );
      // Display error message directly without terminal formatting
      setStreamedResponse(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setIsToolExecuting(false);
    } finally {
      setIsLoading(false);
      setIsToolExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Colorful gradient glow behind glass */}

      {/* <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-neutral-500/50 to-white/50 rounded-2xl blur-xl opacity-30"></div> */}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="max-w-4xl mx-auto space-y-3 py-4">
          {messages?.length === 0 && <WelcomeMessage />}

          {messages?.map((message: Doc<"messages">) => (
            <MessageBubble
              key={message._id}
              content={message.content}
              isUser={message.role === "user"}
            />
          ))}

          {streamedResponse && <MessageBubble content={streamedResponse} />}

          {/* Tool execution indicator */}
          {isToolExecuting && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className="rounded-2xl px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[0.3, 0.15, 0].map((delay, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: `-${delay}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {currentTool?.name
                      ? `Using ${currentTool.name}...`
                      : "Processing..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamedResponse && !isToolExecuting && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className="rounded-2xl px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700">
                <div className="flex items-center gap-1.5">
                  {[0.3, 0.15, 0].map((delay, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: `-${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Audio Visualizer - DJ Style (separate from input) */}
      {isSpeaking && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-black py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Audio visualizer bars - like DJ speakers with GLOW */}
            <div className="flex items-end justify-center gap-3 h-32">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="audio-visualizer-bar w-4 rounded-t-lg shadow-glow"
                  style={{
                    background: `linear-gradient(to top, 
                      rgb(147, 51, 234), 
                      rgb(236, 72, 153), 
                      rgb(59, 130, 246))`,
                    boxShadow: `
                      0 0 20px rgba(147, 51, 234, 0.8),
                      0 0 40px rgba(236, 72, 153, 0.6),
                      0 0 60px rgba(59, 130, 246, 0.4)
                    `,
                    minHeight: "20px",
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.5 + Math.random() * 0.4}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-blue-400 font-semibold tracking-wide animate-pulse">
                🎵 AI SPEAKING
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input form */}
      <footer className="border-t border-white/30 dark:border-white/20 bg-white/50 dark:bg-black/40 backdrop-blur-2xl p-4 shadow-xl">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto"
        >
          {/* Voice controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`text-xs ${
                  autoSpeak
                    ? "bg-blue-950 text-blue-400 border-blue-800"
                    : "text-neutral-700 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 mr-1.5" />
                Auto-speak {autoSpeak ? "ON" : "OFF"}
              </Button>

              {isSpeaking && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleStopSpeaking}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950 border-red-800 animate-pulse"
                >
                  <VolumeX className="w-3.5 h-3.5 mr-1.5" />
                  Stop Speaking
                </Button>
              )}
            </div>

            {isSpeaking && (
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <div className="flex gap-0.5">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1 h-3 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="font-medium">Speaking...</span>
              </div>
            )}

            {listening && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <div className="flex gap-0.5">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1 h-3 bg-red-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="font-medium">Listening...</span>
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-2">
            {/* Microphone button */}
            {browserSupportsSpeechRecognition && (
              <Button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`rounded-2xl h-11 w-11 p-0 flex items-center justify-center transition-all backdrop-blur-xl shadow-lg ${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/30 text-neutral-700 dark:text-neutral-200"
                }`}
                title={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Message AI Agent..."}
              className={`flex-1 py-3 px-4 rounded-2xl backdrop-blur-xl border focus:outline-none focus:ring-2 focus:border-transparent pr-12 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 transition-all shadow-lg ${
                listening
                  ? "border-red-500/50 focus:ring-red-500/50 bg-red-500/20 animate-pulse text-white"
                  : "border-white/30 focus:ring-purple-400/50 focus:border-white/50 bg-white/60 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
              }`}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-2xl h-9 w-9 p-0 flex items-center justify-center transition-all shadow-lg ${
                input.trim()
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default function ChatInterface(props: ChatInterfaceProps) {
  return (
    <SpeakingProvider>
      <ChatInterfaceInner {...props} />
    </SpeakingProvider>
  );
}
