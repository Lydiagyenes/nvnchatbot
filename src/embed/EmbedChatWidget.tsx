/**
 * Standalone Embed Chat Widget
 * This component is designed to be built separately and embedded in WordPress
 */
import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { createRoot } from "react-dom/client";

// ============= Types =============
type ChatMessage = { role: "user" | "assistant"; content: string };

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface NVNChatConfig {
  apiUrl?: string;
  apiKey?: string;
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  accentColor?: string;
}

// ============= Chat Service =============
const createChatService = (apiUrl: string, apiKey: string) => {
  const sessionId = crypto.randomUUID();

  return async function streamChat({
    messages,
    onDelta,
    onDone,
    onError,
  }: {
    messages: ChatMessage[];
    onDelta: (deltaText: string) => void;
    onDone: () => void;
    onError?: (error: string) => void;
  }) {
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ messages, sessionId }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: "Hiba történt" }));
        const errorMessage = errorData.error || "Hiba történt a válasz során";
        
        if (resp.status === 429) {
          onError?.("Túl sok kérés érkezett, kérlek várj egy kicsit! 🙏");
        } else if (resp.status === 402) {
          onError?.("Az AI szolgáltatás jelenleg nem elérhető.");
        } else {
          onError?.(errorMessage);
        }
        onDone();
        return;
      }

      if (!resp.body) {
        onError?.("Nem sikerült a válasz fogadása");
        onDone();
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      onDone();
    } catch (error) {
      console.error("NVN Chat error:", error);
      onError?.("Hiba történt a kapcsolat során. Kérlek próbáld újra!");
      onDone();
    }
  };
};

// ============= Inline Styles (no external CSS needed) =============
const styles = {
  container: (position: string): React.CSSProperties => ({
    position: "fixed",
    bottom: "24px",
    [position === "bottom-left" ? "left" : "right"]: "24px",
    zIndex: 99999,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  button: (primaryColor: string): React.CSSProperties => ({
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.3s ease",
  }),
  window: {
    display: "flex",
    flexDirection: "column" as const,
    height: "500px",
    width: "380px",
    maxWidth: "calc(100vw - 2rem)",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    animation: "nvnSlideUp 0.3s ease-out",
  },
  header: (primaryColor: string): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -15)})`,
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  headerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: 600,
    color: "#ffffff",
    fontSize: "16px",
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  headerSubtitle: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.7)",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px",
    backgroundColor: "#faf8f5",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "32px 16px",
    color: "#6b7280",
    fontSize: "14px",
  },
  messageRow: (isUser: boolean): React.CSSProperties => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
    marginBottom: "12px",
    animation: "nvnSlideUp 0.2s ease-out",
  }),
  messageBubble: (isUser: boolean, primaryColor: string, accentColor: string): React.CSSProperties => ({
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    backgroundColor: isUser ? accentColor : primaryColor,
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: 1.5,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  }),
  inputContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  textarea: {
    flex: 1,
    resize: "none" as const,
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "44px",
    maxHeight: "120px",
    outline: "none",
  },
  sendButton: (accentColor: string): React.CSSProperties => ({
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: accentColor,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  typingIndicator: (primaryColor: string): React.CSSProperties => ({
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "12px",
  }),
  typingBubble: (primaryColor: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "16px 20px",
    borderRadius: "18px 18px 18px 4px",
    backgroundColor: primaryColor,
  }),
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.6)",
    animation: "nvnTyping 1.4s infinite ease-in-out",
  },
};

// Helper to darken/lighten colors
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ============= Icons (inline SVG) =============
const MessageIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ============= Main Widget Component =============
const EmbedChatWidget = ({ config }: { config: NVNChatConfig }) => {
  const {
    apiUrl = "",
    apiKey = "",
    position = "bottom-right",
    primaryColor = "#7e57c2",
    accentColor = "#c2185b",
  } = config;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const streamChat = createChatService(apiUrl, apiKey);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Inject keyframes animation
  useEffect(() => {
    const styleId = "nvn-chat-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes nvnSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nvnTyping {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isTyping) return;

    setInputValue("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

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
        console.error("Chat error:", error);
        if (!assistantContent) {
          setMessages((prev) => [
            ...prev,
            {
              id: botMessageId,
              content: "Sajnálom, jelenleg nem tudok válaszolni. Kérlek próbáld újra később! 💜",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
        setIsTyping(false);
      },
    });
  }, [inputValue, isTyping, messages, streamChat]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown rendering for bot messages
  const renderMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      return <span style={{ whiteSpace: "pre-wrap" }}>{content}</span>;
    }
    // Basic markdown: bold, links, line breaks
    const html = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#ffd700;text-decoration:underline">$1</a>')
      .replace(/\n/g, "<br/>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!isOpen) {
    return (
      <div style={styles.container(position)}>
        <button
          onClick={() => setIsOpen(true)}
          style={styles.button(primaryColor)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Chat megnyitása"
        >
          <MessageIcon />
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container(position)}>
      <div style={styles.window}>
        {/* Header */}
        <div style={styles.header(primaryColor)}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={styles.headerIcon}>
              <SparklesIcon />
            </div>
            <div>
              <div style={styles.headerTitle}>NVN Asszisztens</div>
              <div style={styles.headerSubtitle}>Mindig itt vagyok, ha kérdésed van!</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={styles.closeButton}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ marginBottom: "12px" }}>
                <SparklesIcon />
              </div>
              Szia! 👋 Miben segíthetek a Női Vállalkozók Napjával kapcsolatban?
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={styles.messageRow(msg.isUser)}>
              <div style={styles.messageBubble(msg.isUser, primaryColor, accentColor)}>
                {renderMessage(msg.content, msg.isUser)}
                <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.7 }}>
                  {msg.timestamp.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={styles.typingIndicator(primaryColor)}>
              <div style={styles.typingBubble(primaryColor)}>
                <span style={{ ...styles.typingDot, animationDelay: "0ms" }} />
                <span style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
                <span style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Írj üzenetet..."
            disabled={isTyping}
            rows={1}
            style={{
              ...styles.textarea,
              opacity: isTyping ? 0.5 : 1,
              cursor: isTyping ? "not-allowed" : "text",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            style={{
              ...styles.sendButton(accentColor),
              opacity: !inputValue.trim() || isTyping ? 0.5 : 1,
              cursor: !inputValue.trim() || isTyping ? "not-allowed" : "pointer",
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= Global Init Function =============
declare global {
  interface Window {
    NVNChat: {
      init: (config: NVNChatConfig) => void;
    };
  }
}

window.NVNChat = {
  init: (config: NVNChatConfig) => {
    const container = document.createElement("div");
    container.id = "nvn-chat-widget";
    document.body.appendChild(container);
    
    const root = createRoot(container);
    root.render(<EmbedChatWidget config={config} />);
  },
};

export default EmbedChatWidget;
