import { ChatsSidebarPanel } from "../components/chats-sidebar/chats-sidebar-panel";
import { ChatsSidebarResizable } from "../components/chats-sidebar/chats-sidebar-resizeable";

export const ChatsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChatsSidebarResizable sidebar={<ChatsSidebarPanel />}>
      {children}
    </ChatsSidebarResizable>
  );
};
