"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-950"
        >
          SamjhoSign
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            How it works
          </Link>

          <Link
            href="#what-we-check"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            What we check
          </Link>

          <Link
            href="#upload-agreement"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            Analyze
          </Link>

          {/* History */}
          {userEmail && (
            <Link
              href="/history"
              className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
            >
              My analyses
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {!loading && userEmail ? (
            <>
              <span className="hidden max-w-[220px] truncate text-sm font-medium text-gray-600 sm:block">
                {userEmail}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-xl sm:inline-flex"
              >
                Sign in
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            className="rounded-xl"
            onClick={() => {
              document
                .getElementById("upload-agreement")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Analyze agreement
          </Button>

        </div>
      </div>
    </nav>
  );
}