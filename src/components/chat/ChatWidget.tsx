import { useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { ChatWindow, Message } from "./ChatWindow";
import { streamChat, ChatMessage } from "@/lib/chatService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Convert to API format
    const apiMessages: ChatMessage[] = [
      ...messages.map((m) => ({
        role: m.isUser ? "user" as const : "assistant" as const,
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    let assistantContent = "";
    const botMessageId = `bot-${Date.now()}`;

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && !lastMsg.isUser && lastMsg.id === botMessageId) {
          return prev.map((m) =>
            m.id === botMessageId ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: botMessageId,
            content: assistantContent,
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    };

    await streamChat({
      messages: apiMessages,
      onDelta: updateAssistant,
      onDone: () => setIsTyping(false),
      onError: (error) => {
        toast.error(error);
        // Add error message as bot response
        if (!assistantContent) {
          setMessages((prev) => [
            ...prev,
            {
              id: botMessageId,
              content: "Sajnálom, jelenleg nem tudok válaszolni. Kérlek próbáld újra később, vagy látogass el a noivallalkozoknapja.com oldalra! 💜",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
      },
    });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
          isTyping={isTyping}
        />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-16 h-16 rounded-full gradient-accent shadow-xl",
            "flex items-center justify-center",
            "transition-all duration-300 hover:scale-110",
            "animate-pulse-glow"
          )}
          aria-label="Chat megnyitása"
        >
          <MessageCircle className="w-7 h-7 text-accent-foreground" />
        </button>
      )}
    </div>
  );
};
