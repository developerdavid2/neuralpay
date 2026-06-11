import { ChatConversationArea } from "../components/chat-conversation-area";

interface Props {
  sessionId: string;
}

export const ChatSessionView = ({ sessionId }: Props) => {
  console.log("ChatsSessionView", sessionId);
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ChatConversationArea sessionId={sessionId} />
    </div>
  );
};
