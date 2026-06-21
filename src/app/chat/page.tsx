import { AppShell } from "@/components/app/AppShell";
import { ChatInterface } from "@/components/app/ChatInterface";

export default function ChatPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto min-h-0">
        <ChatInterface />
      </div>
    </AppShell>
  );
}
