import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">404</h1>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Page Not Found</h2>
        <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
          The watch party or page you are looking for doesn&apos;t exist, or has been removed by the administrator.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="default" className="text-xs font-semibold">
              Return Home
            </Button>
          </Link>
          <Link href="/screenings">
            <Button variant="outline" className="text-xs font-semibold">
              Browse Screenings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
