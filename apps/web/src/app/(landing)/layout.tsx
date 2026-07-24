import React, { type ReactNode } from "react";
import Navbar from "@/components/navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
