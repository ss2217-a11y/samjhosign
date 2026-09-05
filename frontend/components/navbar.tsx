"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setEmail(user?.email ?? null);
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setEmail(session?.user?.email ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const scrollToUpload = () => {
    if (window.location.pathname !== "/") {
      window.location.href = "/#upload-agreement";
      return;
    }

    document
      .getElementById("upload-agreement")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">

        {/* ============================================================
            LOGO
        ============================================================ */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            S
          </div>

          <span className="text-lg font-bold tracking-[-0.035em] text-gray-950">
            SamjhoSign
          </span>
        </Link>

        {/* ============================================================
            DESKTOP NAVIGATION
        ============================================================ */}
        <div className="hidden items-center gap-7 md:flex">

          <button
            onClick={scrollToUpload}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-950"
          >
            Analyze
          </button>

          <Link
            href="/#what-we-check"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-950"
          >
            What we check
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-950"
          >
            How it works
          </Link>
        </div>

        {/* ============================================================
            RIGHT SIDE
        ============================================================ */}
        <div className="flex items-center gap-2">

          {!loading && email ? (
            <>
              {/* My analyses */}
              <Link
                href="/history"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 sm:inline-flex"
              >
                My analyses
              </Link>

              {/* User */}
              <div className="hidden h-8 w-px bg-gray-200 sm:block" />

              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold uppercase text-gray-700">
                  {email.charAt(0)}
                </div>

                <span className="max-w-[180px] truncate text-sm font-medium text-gray-700">
                  {email}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
              >
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 sm:inline-flex"
              >
                Sign in
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-gray-800 hover:shadow-md"
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          )}

          {/* Mobile menu shortcut */}
          {!loading && email && (
            <Link
              href="/history"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 sm:hidden"
              aria-label="My analyses"
              title="My analyses"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}