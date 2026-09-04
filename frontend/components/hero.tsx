"use client";

import { Button } from "@/components/ui/button";
import UploadCard from "@/components/upload-card";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-180px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gray-100/80 blur-3xl" />
        <div className="absolute left-[-200px] top-[700px] h-[400px] w-[400px] rounded-full bg-gray-100/60 blur-3xl" />
        <div className="absolute right-[-200px] top-[1100px] h-[450px] w-[450px] rounded-full bg-gray-100/60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* ================= HERO ================= */}
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center pb-20 pt-16 text-center sm:pt-20">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-black" />
            Built for tenants
          </div>

          {/* Heading */}
          <h1 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            Understand your rental agreement.
            <span className="mt-2 block text-gray-400">
              Before you sign.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
            Upload your rental agreement and instantly see the important
            money, deadlines, responsibilities, restrictions, and risks —
            explained in simple English.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-xl px-8 text-base"
              onClick={() => {
                document
                  .getElementById("upload-agreement")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Analyze my agreement
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl px-8 text-base"
              onClick={() => {
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See how it works
            </Button>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-gray-500">
            <span>✓ Plain-English explanations</span>
            <span>✓ Risk insights</span>
            <span>✓ Important deadlines</span>
            <span>✓ Financial terms</span>
          </div>

          {/* Hero mini statement */}
          <div className="mt-14 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 text-left sm:px-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                ✓
              </div>

              <div>
                <p className="font-semibold">
                  Know what you are actually agreeing to.
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  SamjhoSign highlights the parts of a rental agreement that
                  can affect your money, obligations, and ability to leave.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= UPLOAD ================= */}
        <div
          id="upload-agreement"
          className="scroll-mt-24 pb-28"
        >
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Start here
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Upload your agreement
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Give us your rental agreement and we'll turn the complicated
              legal language into something you can understand.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <UploadCard />
          </div>
        </div>

        {/* ================= WHAT WE CHECK ================= */}
        <div className="border-t border-gray-200 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              What we look for
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The details that actually matter.
            </h2>

            <p className="mt-4 text-gray-500">
              Instead of making you read every clause twice, SamjhoSign helps
              you find the information that can have the biggest impact.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                ₹
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Money & payments
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Rent, deposits, maintenance charges, penalties, increases,
                and other financial obligations.
              </p>
            </div>

            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                ⏱
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Deadlines & notice
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Notice periods, renewal dates, payment deadlines, and other
                important dates you shouldn't miss.
              </p>
            </div>

            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                !
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Potential risks
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Clauses that may create unusual responsibilities, penalties,
                restrictions, or other concerns.
              </p>
            </div>

            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                ✓
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Your responsibilities
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Repairs, utilities, maintenance, rules, and responsibilities
                assigned to you in the agreement.
              </p>
            </div>

            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                #
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Restrictions
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Rules around guests, pets, subletting, alterations, usage,
                and other restrictions.
              </p>
            </div>

            {/* Card */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                ?
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Important clauses
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Key terms that deserve a closer look before you agree to the
                contract.
              </p>
            </div>
          </div>
        </div>

        {/* ================= HOW IT WORKS ================= */}
        <div
          id="how-it-works"
          className="scroll-mt-24 border-t border-gray-200 py-28"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From agreement to understanding.
            </h2>

            <p className="mt-4 text-gray-500">
              Three simple steps. No legal expertise required.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                01
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Upload
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Upload your agreement
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Upload your rental agreement as a PDF. SamjhoSign processes
                the document and prepares it for analysis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                02
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Analyze
              </p>

              <h3 className="mt-2 text-xl font-bold">
                AI analyzes the terms
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Important financial terms, deadlines, responsibilities,
                restrictions, and potential risk areas are identified.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                03
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Understand
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Know before you sign
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Get a clear summary and explanations of the clauses that
                matter most to you as a tenant.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FINAL CTA ================= */}
        <div className="py-20">
          <div className="relative overflow-hidden rounded-3xl bg-black px-7 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-400">
                Before you sign
              </p>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Don't sign what you don't understand.
              </h2>

              <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
                Upload your rental agreement and get a clearer picture of
                what you're agreeing to.
              </p>

              <Button
                size="lg"
                variant="secondary"
                className="mt-8 h-12 rounded-xl px-8"
                onClick={() => {
                  document
                    .getElementById("upload-agreement")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Analyze my agreement
              </Button>
            </div>
          </div>
        </div>

        {/* ================= DISCLAIMER ================= */}
        <div className="border-t border-gray-200 py-10 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-6 text-gray-400">
            SamjhoSign helps you understand your rental agreement in simpler
            language. It is an informational tool and does not replace
            professional legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}