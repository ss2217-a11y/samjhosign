import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          SamjhoSign
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="#how-it-works"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            How it works
          </Link>

          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </div>
      </div>
    </nav>
  );
}