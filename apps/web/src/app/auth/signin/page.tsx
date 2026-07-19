// app/auth/signin/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import SignInView from "@/modules/auth/ui/views/sign-in-view";

const Page = async () => {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <SignInView />;
};

export default Page;
