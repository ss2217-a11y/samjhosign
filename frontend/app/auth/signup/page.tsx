"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Account created successfully. Check your email to confirm your account, then sign in."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-gray-950 px-10 py-10 text-white lg:flex lg:flex-col">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-white/[0.05] blur-3xl" />

          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 flex w-fit items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-gray-950 shadow-lg">
              S
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                SamjhoSign
              </div>

              <div className="text-[11px] text-gray-400">
                Understand before you sign
              </div>
            </div>
          </Link>

          {/* Main content */}
          <div className="relative z-10 my-auto max-w-xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-300">
              Your private agreement workspace
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Read the agreement.
              <br />
              <span className="text-gray-400">
                Know the risk.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400">
              SamjhoSign turns complicated rental agreements into clear,
              practical information about money, deadlines, risks, and
              important clauses.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">
              {[
                {
                  number: "01",
                  title: "Plain-English analysis",
                  text: "Understand what your agreement actually says.",
                },
                {
                  number: "02",
                  title: "Financial obligations",
                  text: "See rent, deposits, fees, and other money commitments.",
                },
                {
                  number: "03",
                  title: "Tamil Nadu legal check",
                  text: "Review relevant tenancy-law considerations.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="flex items-start gap-4 border-t border-white/10 pt-4"
                >
                  <span className="text-xs font-semibold text-gray-500">
                    {item.number}
                  </span>

                  <div>
                    <div className="text-sm font-semibold text-gray-200">
                      {item.title}
                    </div>

                    <div className="mt-1 text-sm leading-6 text-gray-500">
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-gray-600">
            SamjhoSign • Agreement understanding workspace
          </div>
        </section>

        {/* RIGHT SIGNUP PANEL */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-10 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white">
                S
              </div>

              <div>
                <div className="text-lg font-bold tracking-tight">
                  SamjhoSign
                </div>

                <div className="text-[11px] text-gray-500">
                  Understand before you sign
                </div>
              </div>
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Create your workspace
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Start analyzing rental agreements with SamjhoSign.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 6 characters"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-7 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-gray-950 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>

            {/* Privacy text */}
            <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs leading-5 text-gray-400">
              By creating an account, you can save and revisit your agreement
              analyses in your private workspace.
            </div>

            {/* Back */}
            <Link
              href="/"
              className="mt-6 block text-center text-xs font-medium text-gray-400 transition hover:text-gray-950"
            >
              ← Back to SamjhoSign
            </Link>

          </div>
        </section>
      </div>
    </main>
  );
}