import { ChatInput } from "../components/chat-input";

export const ChatsView = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">What can I help you with?</h1>
        <p className="text-sm text-muted-foreground">
          Ask me anything about your finances, budgets, or transactions.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <ChatInput />
      </div>
    </div>
  );
};
