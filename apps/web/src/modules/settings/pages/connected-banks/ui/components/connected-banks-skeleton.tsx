import { Card, CardContent } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";

export function ConnectedBanksSkeleton() {
  return (
    <div className="space-y-6">
      {/* Trust Banner Skeleton */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Main Card Skeleton */}
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
