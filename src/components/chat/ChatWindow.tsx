import { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { Button } from "@/components/ui/button";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
  onClose: () => void;
  isTyping?: boolean;
}

export const ChatWindow = ({ messages, onSend, onClose, isTyping }: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[500px] w-[380px] max-w-[calc(100vw-2rem)] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="gradient-primary px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary-foreground">NVN Asszisztens</h3>
            <p className="text-xs text-primary-foreground/70">Mindig itt vagyok, ha kérdésed van!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-container">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-accent mb-3" />
            <p className="text-muted-foreground text-sm">
              Szia! 👋 Miben segíthetek a Női Vállalkozók Napjával kapcsolatban?
            </p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
};
