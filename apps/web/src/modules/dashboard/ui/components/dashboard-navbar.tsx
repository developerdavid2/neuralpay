"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@neuralpay/ui/components/button";
import { Separator } from "@neuralpay/ui/components/separator";
import { SidebarTrigger } from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

const DashboardNavbar = () => {
  const [openCommand, setOpenCommand] = useState(false);

  // TODO: re-enable once DashboardCommand is wired up
  // useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault();
  //       setOpenCommand((open) => !open);
  //     }
  //   };

  //   document.addEventListener("keydown", down);

  //   return () => document.removeEventListener("keydown", down);
  // }, []);

  return (
    <>
      {/* <DashboardCommand open={openCommand} setOpen={setOpenCommand} /> */}
      <nav className="flex px-4 gap-x-2 items-center py-3 border-b shadow-xs bg-sidebar shrink-0 fixed w-full z-50">
        <SidebarTrigger className={cn("size-9 cursor-pointer")} />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Button
          className="h-9 w-fit justify-start font-normal text-muted-foreground hover:text-muted-foreground"
          variant="outline"
          size="sm"
          onClick={() => {
            // setOpenCommand((open) => !open);
          }}
        >
          <SearchIcon />
          Search or type a command
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
        <ModeToggle />
      </nav>
    </>
  );
};
export default DashboardNavbar;
