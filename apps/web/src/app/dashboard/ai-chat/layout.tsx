import React from "react";
import { ChatsLayout } from "@/modules/chats/ui/layouts/chats-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ChatsLayout>{children}</ChatsLayout>;
};

export default Layout;
