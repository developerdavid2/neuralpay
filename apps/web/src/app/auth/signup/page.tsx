// apps/web/src/app/(auth)/sign-in/page.tsx
import { authClient } from "@/lib/auth-client";
import SignUpView from "@/modules/auth/ui/views/signup-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  return <SignUpView />;
};

export default Page;
