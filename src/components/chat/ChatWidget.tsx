import { useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { ChatWindow, Message } from "./ChatWindow";
import { cn } from "@/lib/utils";

// Mock RAG responses - will be replaced with actual RAG integration
const mockResponses: Record<string, string> = {
  mikor: "A Női Vállalkozók Napja 2026. március 19-én, csütörtökön kerül megrendezésre 8:00-tól 18:30-ig! 📅",
  hol: "Az esemény helyszíne a budapesti Bálna, ami egy lenyűgöző környezetet biztosít a rendezvénynek! 📍",
  jegy: "A jegyeket a noivallalkozoknapja.com oldalon tudod megvásárolni. Most akár 43% kedvezménnyel szerezheted be! 🎟️",
  program: "Az eseményen inspiráló előadások, networking lehetőségek, workshopok és kikapcsolódás vár! Egy teljes nap fejlődés és feltöltődés. ✨",
  default: "Köszönöm a kérdésed! Kérlek írd le részletesebben, miben segíthetek a Női Vállalkozók Napjával kapcsolatban. Kérdezhetsz az időpontról, helyszínről, programról vagy a jegyvásárlásról! 💜"
};

const getResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("mikor") || lowerMessage.includes("dátum") || lowerMessage.includes("időpont")) {
    return mockResponses.mikor;
  }
  if (lowerMessage.includes("hol") || lowerMessage.includes("helyszín") || lowerMessage.includes("bálna")) {
    return mockResponses.hol;
  }
  if (lowerMessage.includes("jegy") || lowerMessage.includes("ár") || lowerMessage.includes("kedvezmény") || lowerMessage.includes("vásárl")) {
    return mockResponses.jegy;
  }
  if (lowerMessage.includes("program") || lowerMessage.includes("előadás") || lowerMessage.includes("workshop")) {
    return mockResponses.program;
  }
  
  return mockResponses.default;
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate RAG response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: getResponse(content),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, []);

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
