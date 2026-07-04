import { HydrateClient, prefetchInfinite, trpc } from "@/trpc/trpc-server";
import { NotificationsView } from "@/modules/notifications/ui/views/notifications-view";
import { NOTIFICATION_CATEGORY } from "@neuralpay/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    limit?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const n = Number.parseInt(value ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const category = params.category;
  const normalizedCategory =
    category &&
    NOTIFICATION_CATEGORY.includes(
      category as (typeof NOTIFICATION_CATEGORY)[number],
    )
      ? (category as (typeof NOTIFICATION_CATEGORY)[number])
      : "all";

  const status =
    params.status === "read" || params.status === "unread"
      ? params.status
      : "all";

  const limit = Math.min(parsePositiveInt(params.limit, 20), 50);

  void prefetchInfinite(
    trpc.notifications.appNotifications.list.infiniteQueryOptions(
      {
        limit,
        search: params.search?.trim() || undefined,
        category: normalizedCategory,
        status,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
  );

  return (
    <HydrateClient>
      <NotificationsView
        search={params.search ?? ""}
        category={normalizedCategory}
        status={status}
        limit={limit}
      />
    </HydrateClient>
  );
};

export default Page;
