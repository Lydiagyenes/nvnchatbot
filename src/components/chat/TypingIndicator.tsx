export const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="chat-bubble-bot flex items-center gap-1.5 py-4 px-5">
        <span className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
};
