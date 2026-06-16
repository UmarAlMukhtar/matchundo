import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col gap-2 animate-pulse">
        <div className="h-6 w-40 bg-zinc-900 rounded" />
        <div className="h-3.5 w-60 bg-zinc-900 rounded" />
      </div>

      {/* Filter Row Skeleton */}
      <div className="h-20 w-full bg-zinc-950 border border-zinc-900 rounded-xl mb-8 animate-pulse" />

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[360px] border-zinc-900 bg-zinc-950/40 p-5 flex flex-col justify-between animate-pulse">
            <div>
              <div className="w-full h-36 bg-zinc-900 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-zinc-900 rounded" />
                <div className="h-3.5 w-1/2 bg-zinc-900 rounded" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-zinc-900/60">
              <div className="h-3 w-1/3 bg-zinc-900 rounded" />
              <div className="h-3 w-1/4 bg-zinc-900 rounded" />
              <div className="h-8 w-full bg-zinc-900 rounded-md mt-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
