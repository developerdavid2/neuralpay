import VerifyOtpView from "@/modules/auth/ui/views/verify-otp-view";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  return <VerifyOtpView mode={mode} />;
}
