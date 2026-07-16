import { getServerSession, requireAuth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface AuthenticationLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";
const AuthenticationLayout = async ({
  children,
}: AuthenticationLayoutProps) => {
  const session = await requireAuth();

  // If user is already logged in and verified, they shouldn't be on ANY auth page
  if (session?.user?.emailVerified) {
    redirect("/dashboard");
  }

  // If user exists but email not verified, redirect to OTP
  if (session?.user && !session.user.emailVerified) {
    // Get the current pathname properly
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";

    // Only allow access to verify-otp page
    if (!pathname.includes("/verify-otp")) {
      redirect("/auth/verify-otp");
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden text-foreground font-sans">
      {/* Shared vertical beam */}
      <div className="absolute top-[-50%] left-[50%] rotate-[-30deg] w-16 h-[150%] bg-linear-to-b from-slate-200 via-slate-300 to-transparent blur-[100px] sm:blur-[120px] opacity-70 z-50"></div>

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="relative w-full md:max-w-7xl">
          <div className="relative overflow-hidden rounded-3x ">
            {/* Ambient Light Glows */}

            <div className="relative z-10">{children}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-muted-foreground text-center text-xs pt-6 ">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className=" hover:text-primary underline underline-offset-4 transition"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className=" hover:text-primary underline underline-offset-4 transition"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default AuthenticationLayout;
