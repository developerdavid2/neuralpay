import { cn } from "@neuralpay/ui/lib/utils";
import type { HTMLAttributes } from "react";

export function LandingContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-5 md:px-8 3xl:max-w-450 4xl:max-w-500",
        className,
      )}
      {...props}
    />
  );
}
