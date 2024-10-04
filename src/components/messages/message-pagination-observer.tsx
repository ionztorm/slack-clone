type MessagePaginationObserverProps = {
  canLoadMore: boolean;
  loadMore: () => void;
};
export function MessagePaginationObserver({
  canLoadMore,
  loadMore,
}: MessagePaginationObserverProps) {
  return (
    <div
      className="h-1"
      ref={(element) => {
        if (element) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting && canLoadMore) loadMore();
            },
            { threshold: 1.0 },
          );
          observer.observe(element);
          return () => observer.disconnect();
        }
      }}
    />
  );
}
