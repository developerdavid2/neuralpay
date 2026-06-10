import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@neuralpay/ui/components/resizable";

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
        maxSize={25}
        className="bg-sidebar h-screen"
      >
        <p>Aside Chat Side bar</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
