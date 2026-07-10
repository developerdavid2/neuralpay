"use client";

import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";

export function SecuritySettingsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-gray-400/5">
          <CardHeader className="pb-0">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
