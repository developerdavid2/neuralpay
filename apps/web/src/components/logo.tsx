import { useSidebar } from "@neuralpay/ui/components/sidebar";

export function NeuralPayLogo() {
  const { state } = useSidebar();
  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      {/* swap this div for <Image> once you have a logo */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#2E2B3D] bg-[#252330]">
        <div className="size-3.5 rounded-sm bg-[#7C3AED] opacity-80" />
      </div>
      {state === "expanded" && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          NeuralPay
        </span>
      )}
    </div>
  );
}
