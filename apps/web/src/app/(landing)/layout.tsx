import Navbar from "@/components/navbar";
import { PreloaderGate } from "@/modules/landing/components/preloader-gate";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <PreloaderGate>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </PreloaderGate>
    </div>
  );
};

export default Layout;
