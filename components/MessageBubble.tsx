"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { BotIcon, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "./ui/button";
import { useSpeaking } from "@/lib/context/speaking";

interface MessageBubbleProps {
  content: string;
  isUser?: boolean;
}

const formatMessage = (content: string): string => {
  // First unescape backslashes
  content = content.replace(/\\\\/g, "\\");

  // Then handle newlines
  content = content.replace(/\\n/g, "\n");

  // Remove only the markers but keep the content between them
  content = content.replace(/---START---\n?/g, "").replace(/\n?---END---/g, "");

  // Trim any extra whitespace that might be left
  return content.trim();
};

export function MessageBubble({ content, isUser }: MessageBubbleProps) {
  const { user } = useUser();
  const { isSpeaking, startSpeaking, stopSpeaking, audioRef } = useSpeaking();
  const formattedContent = formatMessage(content);

  const handleSpeak = async () => {
    if (isSpeaking || isUser) return;

    // Clean the text for TTS
    const cleanText = formattedContent
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/`/g, "")
      .trim();

    if (!cleanText || cleanText.length < 3) return;

    try {
      startSpeaking();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) {
        console.error("TTS failed");
        stopSpeaking();
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        stopSpeaking();
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        stopSpeaking();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      stopSpeaking();
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm ring-1 ring-inset relative ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none ring-blue-700"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none ring-neutral-300 dark:ring-neutral-700"
        }`}
      >
        {/* Speaker button for AI messages */}
        {!isUser && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            {isSpeaking ? "Speaking..." : "Speak"}
          </Button>
        )}

        <div className="text-[15px] leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2">
          {isUser ? (
            <div className="whitespace-pre-wrap text-white">
              {formattedContent}
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                // Style headings
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                // Style lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-neutral-900 dark:text-neutral-100 ml-2">
                    {children}
                  </li>
                ),
                // Style paragraphs
                p: ({ children }) => (
                  <p className="text-neutral-900 dark:text-neutral-100 my-2">
                    {children}
                  </p>
                ),
                // Style code blocks
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code: ({ inline, children, ...props }: any) =>
                  inline ? (
                    <code
                      className="bg-neutral-200 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block bg-neutral-200 dark:bg-neutral-900 p-2 rounded text-sm font-mono overflow-x-auto text-neutral-900 dark:text-neutral-100"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                // Style strong/bold
                strong: ({ children }) => (
                  <strong className="font-bold text-neutral-900 dark:text-neutral-100">
                    {children}
                  </strong>
                ),
                // Style links
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          )}
        </div>
        <div
          className={`absolute bottom-0 ${
            isUser
              ? "right-3 translate-x-1/2 translate-y-1/2"
              : "left-3 -translate-x-1/2 translate-y-1/2"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 ${
              isUser
                ? "bg-neutral-300 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-700"
                : "bg-blue-600 border-neutral-300 dark:border-neutral-800"
            } flex items-center justify-center shadow-sm`}
          >
            {isUser ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <BotIcon className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
