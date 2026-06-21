import { AppShell } from "@/components/app/AppShell";
import { ChatInterface } from "@/components/app/ChatInterface";

export default function ChatPage() {
  return (
    <AppShell>
      {/* h-full so ChatInterface can fill the available space and scroll internally */}
      <div className="h-full">
        <ChatInterface />
      </div>
    </AppShell>
  );
}
