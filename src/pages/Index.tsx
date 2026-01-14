import { DemoHeader } from "@/components/demo/DemoHeader";
import { DemoNav } from "@/components/demo/DemoNav";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoContent } from "@/components/demo/DemoContent";
import { ChatWidget } from "@/components/chat/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Demo Site Layout - Will be removed for WordPress plugin */}
      <DemoHeader />
      <DemoNav />
      <DemoHero />
      <DemoContent />
      
      {/* Chat Widget - This is the actual plugin component */}
      <ChatWidget />
    </div>
  );
};

export default Index;
