import { cn } from "@neuralpay/ui/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-2xl bg-accent", className)}
      {...props}
    />
  );
}

export { Skeleton };
