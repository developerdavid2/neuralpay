"use client";

// ✅ import the hook
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";
import { ChevronUp, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function DashboardUserButton() {
  const { data: session, isPending } = authClient.useSession();
  const { state } = useSidebar();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isPending || !session?.user) return null;
  const { name, email } = session.user;
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const onLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth/signin"),
        onError: () => setIsLoggingOut(false),
      },
    });
  };

  // Avatar and rest of component remains the same
  const Avatar = (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]">
      <span className="text-xs font-semibold text-white">{initials}</span>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "h-auto gap-2 rounded-lg bg-secondary/50",
                "hover:bg-secondary/30",
                " cursor-pointer",
                state === "collapsed" && "justify-center px-0",
              )}
            >
              {Avatar}
              {state === "expanded" && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-foreground">
                      {name}
                    </span>
                    <span className="truncate text-xs text-[#8B88A0]">
                      {email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-[#8B88A0]" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 ml-2 font-sans"
            side="right"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-[#8B88A0]">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-secondary" />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/")}
            >
              <CreditCard className="mr-2 size-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
