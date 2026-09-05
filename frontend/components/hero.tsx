"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/upload-card";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-white">

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-250px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gray-100 blur-3xl" />

        <div className="samjho-grid absolute inset-0 opacity-20" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* ============================================================
            HERO
        ============================================================ */}

        <div className="grid min-h-[calc(100vh-64px)] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-24">

          {/* LEFT SIDE */}

          <div className="max-w-2xl samjho-fade-up">

            {/* Badge */}

            <div className="samjho-fade-up-delay-1 mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm">
              <span className="samjho-pulse-soft h-2 w-2 rounded-full bg-gray-950" />
              Rental agreement intelligence
            </div>

            {/* Heading */}

            <h1 className="samjho-fade-up-delay-2 text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[5.4rem]">
              Know what
              <br />
              you're signing.
            </h1>

            <p className="samjho-fade-up-delay-3 mt-7 max-w-xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
              SamjhoSign reads your rental agreement and surfaces the
              money, deadlines, responsibilities, restrictions, and
              potential risks that actually matter.
            </p>

            {/* CTA */}

            <div className="samjho-fade-up-delay-4 mt-9 flex flex-col gap-3 sm:flex-row">

              <Button
                size="lg"
                className="samjho-button h-13 rounded-xl px-7 text-base shadow-lg shadow-black/10"
                onClick={() => scrollTo("upload-agreement")}
              >
                Analyze my agreement
                <span className="ml-2 text-lg">→</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="samjho-button h-13 rounded-xl border-gray-200 bg-white px-7 text-base"
                onClick={() => scrollTo("how-it-works")}
              >
                See how it works
              </Button>

            </div>

            {/* Trust */}

            <div className="samjho-fade-up-delay-4 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span>✓ Plain English</span>
              <span>✓ Risk insights</span>
              <span>✓ Important deadlines</span>
              <span>✓ Financial terms</span>
            </div>

          </div>

          {/* ============================================================
              RIGHT SIDE — PRODUCT PREVIEW
          ============================================================ */}

          <div className="relative mx-auto w-full max-w-[500px] samjho-fade-up-delay-2 lg:mx-0 lg:ml-auto">

            {/* Decorative circle */}

            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gray-100 blur-2xl" />

            {/* Main preview */}

            <div className="samjho-float relative rounded-[2rem] border border-gray-200 bg-white p-3 shadow-2xl shadow-black/10">

              {/* Browser header */}

              <div className="flex items-center justify-between rounded-t-[1.5rem] border-b border-gray-100 px-5 py-4">

                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  SamjhoSign analysis
                </span>

              </div>

              {/* Report */}

              <div className="p-5 sm:p-7">

                {/* File */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-xs font-bold text-white">
                      PDF
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        rental-agreement.pdf
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Agreement analysis
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Analyzed
                  </span>

                </div>

                {/* Risk summary */}

                <div className="mt-7 rounded-2xl bg-gray-950 p-5 text-white">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Overall assessment
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        Review carefully
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm">
                      !
                    </div>

                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[58%] rounded-full bg-white" />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    A few terms deserve your attention before signing.
                  </p>

                </div>

                {/* Metrics */}

                <div className="mt-4 grid grid-cols-3 gap-3">

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Money
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-950">
                      ₹18k
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      monthly rent
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Notice
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-950">
                      60d
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      notice period
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Attention
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-950">
                      3
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      key areas
                    </p>
                  </div>

                </div>

                {/* Findings */}

                <div className="mt-5 space-y-3">

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3.5">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold">
                      ₹
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Security deposit
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        Financial obligation identified
                      </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500">
                      Review
                    </span>

                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3.5">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold">
                      !
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Termination clause
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        Important condition found
                      </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500">
                      Review
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Floating label */}

            <div className="samjho-scale-in absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Simple explanations
                  </p>

                  <p className="text-[11px] text-gray-400">
                    No legal jargon
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ============================================================
            UPLOAD SECTION
        ============================================================ */}

        <div
          id="upload-agreement"
          className="scroll-mt-24 pb-32"
        >

          <div className="samjho-fade-up rounded-[2rem] border border-gray-200 bg-gray-50 p-5 sm:p-8 lg:p-10">

            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                  Start your review
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-4xl">
                  Upload your agreement
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Drop your rental agreement below and we'll break down
                  the terms that matter to you.
                </p>

              </div>

              <div className="hidden rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-500 sm:block">
                PDF · Max 10 MB
              </div>

            </div>

            <div className="mx-auto max-w-4xl">
              <UploadCard />
            </div>

          </div>

        </div>

        {/* ============================================================
            WHAT WE CHECK
        ============================================================ */}

        <div
          id="what-we-check"
          className="scroll-mt-24 border-t border-gray-200 py-28"
        >

          <div className="samjho-fade-up grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                What we look for
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-5xl">
                The details that actually matter.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                SamjhoSign focuses on the parts of a rental agreement
                that can have the biggest impact on you.
              </p>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {[
                [
                  "₹",
                  "Money & payments",
                  "Rent, deposits, penalties, maintenance and increases.",
                ],
                [
                  "⏱",
                  "Deadlines & notice",
                  "Notice periods, renewal dates and important deadlines.",
                ],
                [
                  "!",
                  "Potential risks",
                  "Clauses that may create unusual obligations or concerns.",
                ],
                [
                  "✓",
                  "Responsibilities",
                  "Repairs, utilities, maintenance and tenant duties.",
                ],
                [
                  "#",
                  "Restrictions",
                  "Guests, pets, subletting, alterations and usage rules.",
                ],
                [
                  "?",
                  "Important clauses",
                  "Key terms that deserve a closer look.",
                ],
              ].map(([icon, title, description]) => (
                <div
                  key={title}
                  className="samjho-card samjho-fade-up rounded-2xl p-6"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
                      {icon}
                    </div>

                    <h3 className="font-semibold text-gray-950">
                      {title}
                    </h3>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-500">
                    {description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* ============================================================
            HOW IT WORKS
        ============================================================ */}

        <div
          id="how-it-works"
          className="scroll-mt-24 border-t border-gray-200 py-28"
        >

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-5xl">
              Three steps to clarity.
            </h2>

          </div>

          <div className="samjho-fade-up-delay-1 mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">

            {[
              {
                number: "01",
                label: "UPLOAD",
                title: "Give us your agreement",
                text: "Upload your rental agreement as a PDF and let SamjhoSign process it.",
              },
              {
                number: "02",
                label: "ANALYZE",
                title: "We find what matters",
                text: "Important financial terms, deadlines, responsibilities and risk areas are identified.",
              },
              {
                number: "03",
                label: "UNDERSTAND",
                title: "Know before you sign",
                text: "Get a simple explanation of the terms that deserve your attention.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="samjho-card samjho-fade-up rounded-3xl p-8"
              >

                <div className="flex items-center justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    {step.number}
                  </span>

                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400">
                    {step.label}
                  </span>

                </div>

                <h3 className="mt-8 text-xl font-bold text-gray-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {step.text}
                </p>

              </div>
            ))}

          </div>

        </div>

        {/* ============================================================
            FINAL CTA
        ============================================================ */}

        <div className="py-20">

          <div className="samjho-scale-in relative overflow-hidden rounded-[2rem] bg-gray-950 px-7 py-16 text-white sm:px-12 sm:py-24">

            <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  Before you sign
                </p>

                <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Don't sign what you don't understand.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  Get a clearer picture of your rental agreement in
                  minutes.
                </p>

              </div>

              <Button
                size="lg"
                variant="secondary"
                className="samjho-button h-13 rounded-xl px-8 text-base"
                onClick={() => scrollTo("upload-agreement")}
              >
                Analyze my agreement
                <span className="ml-2 text-lg">→</span>
              </Button>

            </div>

          </div>

        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <footer className="border-t border-gray-200 py-12">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <Link
                href="/"
                className="text-xl font-bold tracking-[-0.035em] text-gray-950"
              >
                SamjhoSign
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
                Understand your rental agreement before you sign.
                Complicated contract language, explained simply.
              </p>

            </div>

            <div>

              <p className="text-sm font-semibold text-gray-900">
                Product
              </p>

              <div className="mt-4 space-y-3">

                <button
                  onClick={() => scrollTo("upload-agreement")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  Analyze agreement
                </button>

                <button
                  onClick={() => scrollTo("what-we-check")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  What we check
                </button>

                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  How it works
                </button>

              </div>

            </div>

            <div>

              <p className="text-sm font-semibold text-gray-900">
                Important
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                SamjhoSign provides AI-powered explanations for
                informational purposes. It does not provide legal advice
                or determine whether a clause is legally enforceable.
              </p>

            </div>

          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} SamjhoSign. All rights reserved.
            </p>

            <p>
              Built to help tenants understand before they sign.
            </p>

          </div>

        </footer>

      </div>
    </section>
  );
}