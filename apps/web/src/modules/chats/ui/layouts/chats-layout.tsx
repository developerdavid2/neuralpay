import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@neuralpay/ui/components/resizable";
import { ChatsSidebarPanel } from "../components/chats-sidebar/chats-sidebar-panel";
import { ChevronLeft } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";

export const ChatsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full flex-1">
      <ResizablePanel className="h-full" defaultSize={75}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={25}
        minSize={15}
        maxSize={35}
        collapsible={true}
        className="bg-sidebar"
      >
        <ChatsSidebarPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
