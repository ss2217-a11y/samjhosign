"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import UploadCard from "@/components/upload-card";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
      setCheckingAuth(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />
          Loading SamjhoSign...
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-white text-black">
        <Navbar />
        <Hero />
      </main>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
      <Navbar />

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                WORKSPACE
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                Understand your
                <br className="hidden sm:block" />
                agreement.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
                Upload a rental agreement and get a clear breakdown of money,
                deadlines, risks, important clauses, and Tamil Nadu legal
                references.
              </p>
            </div>

            <Link
              href="/history"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              View my analyses
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-gray-950">
                Analyze an agreement
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload your PDF to start a new analysis.
              </p>
            </div>

            <UploadCard />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest text-gray-400">
                  ANALYSIS INCLUDES
                </p>
                <h3 className="mt-2 text-lg font-bold text-gray-950">
                  What you'll get
                </h3>
              </div>

              <div className="space-y-4">
                <DashboardFeature number="01" title="Money" description="Rent, deposits and other financial obligations." />
                <DashboardFeature number="02" title="Deadlines" description="Notice periods, expiry dates and key timelines." />
                <DashboardFeature number="03" title="Risks" description="Clauses that may deserve closer attention." />
                <DashboardFeature number="04" title="Legal check" description="Tamil Nadu tenancy references from official sources." />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400">
                    YOUR WORKSPACE
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-gray-950">
                    Previous analyses
                  </h3>
                </div>

                <Link
                  href="/history"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                >
                  →
                </Link>
              </div>

              <p className="text-sm leading-6 text-gray-500">
                Your saved agreement reports are available in your analysis
                history.
              </p>

              <Link
                href="/history"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-950 shadow-sm transition hover:bg-gray-50"
              >
                Open My Analyses
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Private workspace
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Your saved analyses are tied to your account and protected
                    by your workspace access.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <InfoBlock title="Plain English" description="Complex agreement wording is presented in a clearer, easier-to-understand format." />
            <InfoBlock title="Evidence from your agreement" description="Findings are connected back to wording extracted from the document." />
            <InfoBlock title="Informational only" description="SamjhoSign helps you understand an agreement and is not a substitute for legal advice." />
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-[#f7f7f5]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} SamjhoSign</span>
          <span>Rental agreement intelligence for clearer decisions.</span>
        </div>
      </footer>
    </main>
  );
}

function DashboardFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500">
        {number}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="mt-0.5 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}
