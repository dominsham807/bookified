"use client";

import { Mic } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Messages } from "@/types";

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;
  currentUserMessage: string;
}

const Transcript = ({
  messages,
  currentMessage,
  currentUserMessage,
}: TranscriptProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const hasMessages =
    messages.length > 0 ||
    currentMessage.length > 0 ||
    currentUserMessage.length > 0;

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages, currentMessage, currentUserMessage]);

  return (
    <div className="transcript-container min-h-[400px]">
      {hasMessages ? (
        <div
          ref={messagesRef}
          className="transcript-messages"
          role="log"
          aria-live="polite"
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={`${index}-${message.role}`}
                className={`transcript-message ${
                  isUser
                    ? "transcript-message-user"
                    : "transcript-message-assistant"
                }`}
              >
                <div
                  className={`transcript-bubble ${
                    isUser
                      ? "transcript-bubble-user"
                      : "transcript-bubble-assistant"
                  }`}
                >
                  <span className="break-words whitespace-pre-wrap">
                    {message.content}
                  </span>
                </div>
              </div>
            );
          })}
          {currentUserMessage && (
            <div className="transcript-message transcript-message-user">
              <div className="transcript-bubble transcript-bubble-user">
                <span className="break-words whitespace-pre-wrap">
                  {currentUserMessage}
                </span>
                <span className="transcript-cursor" aria-hidden="true" />
              </div>
            </div>
          )}
          {currentMessage && (
            <div className="transcript-message transcript-message-assistant">
              <div className="transcript-bubble transcript-bubble-assistant">
                <span className="break-words whitespace-pre-wrap">
                  {currentMessage}
                </span>
                <span className="transcript-cursor" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="transcript-empty">
          <Mic className="mb-4 size-12 text-[#663820]" aria-hidden="true" />
          <p className="transcript-empty-text">No conversation yet</p>
          <p className="transcript-empty-hint">
            Start a conversation with your book to see the transcript here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Transcript;