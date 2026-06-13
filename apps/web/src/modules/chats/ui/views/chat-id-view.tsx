import { ChatConversationArea } from "../components/chat-conversation-area";

interface Props {
  sessionId: string;
  initialMessage?: string;
}

export const ChatIdView = ({ sessionId, initialMessage }: Props) => {
  return (
    <div className="flex w-full flex-col h-full">
      <ChatConversationArea
        sessionId={sessionId}
        initialMessage={initialMessage}
      />
    </div>
  );
};
