import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] shadow-sm",
          isUser ? "chat-bubble-user" : "chat-bubble-bot"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:ml-4 [&>ul>li]:mb-1 [&>ol]:mb-2 [&>ol]:ml-4 [&>ol>li]:mb-1 [&>strong]:font-semibold [&>h1]:text-base [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mb-1 [&>a]:text-primary [&>a]:underline">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        )}
        {timestamp && (
          <span className={cn(
            "text-[10px] mt-1 block opacity-70",
          )}>
            {timestamp.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
