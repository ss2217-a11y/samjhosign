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
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
          {/* Logo */}
          <div className="text-center">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight text-gray-950"
            >
              SamjhoSign
            </Link>

            <h1 className="mt-12 text-4xl font-bold tracking-tight text-gray-950">
              Welcome back
            </h1>

            <p className="mt-4 text-lg text-gray-500">
              Sign in to access your SamjhoSign account.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="mt-12 space-y-7">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-lg font-medium text-gray-900"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-3 block text-lg font-medium text-gray-900"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-8 text-center text-lg text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-gray-950 hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 transition hover:text-gray-700"
            >
              ← Back to SamjhoSign
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}