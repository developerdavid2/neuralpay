import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Button } from "@neuralpay/ui/components/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading?: boolean;
  hideEndMessage?: boolean;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading = false,
  hideEndMessage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isIntersecting,
    isManual,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage || isLoading}
          onClick={() => fetchNextPage()}
          className="gap-2"
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more...
            </>
          ) : (
            "Load more"
          )}
        </Button>
      ) : !hideEndMessage ? (
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      ) : null}
    </div>
  );
};
