"use client";

import { useChatStore } from "@/modules/chats/store/use-chat-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@neuralpay/ui/components/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@neuralpay/ui/components/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

interface Props {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function ChatsSidebarResizable({ children, sidebar }: Props) {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const { sessionSidebarOpen, setSessionSidebarOpen } = useChatStore();

  const toggle = () => {
    const panel = panelRef.current;
    if (!panel) return;

    if (sessionSidebarOpen) {
      panel.collapse();
      setSessionSidebarOpen(false);
    } else {
      panel.expand();
      setSessionSidebarOpen(true);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full flex-1">
      <ResizablePanel className="h-full" defaultSize={75}>
        {children}
      </ResizablePanel>
      <ResizableHandle className="w-5 bg-border/20 hover:bg-border transition-colors duration-150">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="z-10 flex items-center justify-center w-8 h-20 rounded-full bg-sidebar border border-border/40 shadow-sm cursor-pointer transition-colors"
              >
                {sessionSidebarOpen ? (
                  <ChevronRight className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="size-4 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>

            <TooltipContent side="left">
              {sessionSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ResizableHandle>

      <ResizablePanel
        ref={panelRef}
        defaultSize={25}
        minSize={20}
        maxSize={35}
        collapsible
        onCollapse={() => setSessionSidebarOpen(false)}
        onExpand={() => setSessionSidebarOpen(true)}
        className="bg-sidebar"
      >
        {sidebar}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
