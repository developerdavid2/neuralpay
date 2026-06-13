import { ChatConversationArea } from "../components/chat-conversation-area";

interface Props {
  sessionId: string;
  initialMessage?: string;
}

export const ChatIdView = ({ sessionId, initialMessage }: Props) => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ChatConversationArea
        sessionId={sessionId}
        initialMessage={initialMessage}
      />
    </div>
  );
};
