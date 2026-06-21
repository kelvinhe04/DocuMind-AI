import { AppShell } from "@/components/app/AppShell";
import { ChatInterface } from "@/components/app/ChatInterface";

export default function ChatPage() {
  return (
    <AppShell noPadding>
      <div className="flex flex-1 min-h-0 h-full">
        <ChatInterface />
      </div>
    </AppShell>
  );
}
