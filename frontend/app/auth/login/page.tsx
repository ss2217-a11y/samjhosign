"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] p-3 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:min-h-[calc(100vh-40px)]">
        {/* =====================================================
            LEFT PANEL
        ====================================================== */}
        <section className="relative hidden w-[48%] overflow-hidden bg-[#080b12] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-white/[0.03] blur-3xl" />

          {/* Logo */}
          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-black shadow-lg">
                S
              </span>

              <span className="text-xl font-semibold tracking-tight">
                SamjhoSign
              </span>
            </Link>
          </div>

          {/* Main message */}
          <div className="relative max-w-md">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Rental agreement intelligence
            </div>

            <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.04em] xl:text-6xl">
              Know what you're
              <span className="mt-2 block text-gray-500">
                signing.
              </span>
            </h1>

            <p className="mt-7 max-w-sm text-base leading-7 text-gray-400">
              SamjhoSign turns complicated rental agreements into clear,
              practical information about money, deadlines, responsibilities,
              restrictions, and potential risks.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
                  ✓
                </span>
                <span className="text-sm text-gray-300">
                  Plain-English explanations
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
                  ✓
                </span>
                <span className="text-sm text-gray-300">
                  Financial and risk insights
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
                  ✓
                </span>
                <span className="text-sm text-gray-300">
                  Tamil Nadu legal reference checks
                </span>
              </div>
            </div>
          </div>

          {/* Bottom statement */}
          <div className="relative">
            <div className="border-t border-white/10 pt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                Before you sign
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Understand the agreement. Then make your decision.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT PANEL
        ====================================================== */}
        <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[52%] lg:px-16">
          {/* Mobile logo */}
          <div className="mb-12 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
                S
              </span>

              <span className="text-xl font-bold tracking-tight text-gray-950">
                SamjhoSign
              </span>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md">
            {/* Heading */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Your workspace
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.035em] text-gray-950 sm:text-5xl">
                Welcome back.
              </h2>

              <p className="mt-4 text-base leading-7 text-gray-500">
                Sign in to access your saved agreement analyses.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-semibold text-gray-900"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="h-13 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-950 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-950 focus:bg-white focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Password
                  </label>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-13 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-950 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-950 focus:bg-white focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    !
                  </div>

                  <p className="text-sm leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#080b12] px-6 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="text-gray-400 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                New here?
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Signup */}
            <Link
              href="/auth/signup"
              className="flex h-13 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50"
            >
              Create an account
            </Link>

            {/* Back */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-gray-400 transition hover:text-gray-900"
              >
                ← Back to SamjhoSign
              </Link>
            </div>

            {/* Disclaimer */}
            <p className="mt-10 text-center text-[11px] leading-5 text-gray-400">
              SamjhoSign provides AI-powered explanations for
              informational purposes and does not provide legal advice.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}