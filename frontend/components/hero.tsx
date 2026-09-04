"use client";

import { Button } from "@/components/ui/button";
import UploadCard from "@/components/upload-card";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gray-100/70 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-24">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm">
          <span className="mr-2 h-2 w-2 rounded-full bg-black" />
          Rental agreement intelligence for tenants
        </div>

        {/* Main heading */}
        <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Understand your rental agreement
          <span className="block text-muted-foreground">
            before you sign.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Upload your rental agreement and quickly understand the clauses,
          risks, financial obligations, and important deadlines — explained
          in simple English.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="px-7"
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
            className="px-7"
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
        <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>✓ Plain-English explanations</span>
          <span>✓ Risk insights</span>
          <span>✓ Important deadlines</span>
          <span>✓ Financial terms</span>
        </div>

        {/* Upload section */}
        <div
          id="upload-agreement"
          className="mt-14 w-full max-w-3xl scroll-mt-24"
        >
          <UploadCard />
        </div>

        {/* How it works */}
        <div
          id="how-it-works"
          className="mt-24 w-full max-w-5xl scroll-mt-24"
        >
          <div className="mb-10">
            <p className="text-sm font-medium text-muted-foreground">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From agreement to understanding.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              SamjhoSign turns complicated rental agreements into information
              you can actually understand.
            </p>
          </div>

          <div className="grid gap-5 text-left md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                1
              </div>

              <h3 className="text-lg font-semibold">
                Upload your agreement
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload your rental agreement as a PDF. SamjhoSign extracts
                the agreement text for analysis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                2
              </div>

              <h3 className="text-lg font-semibold">
                AI analyzes the terms
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Important financial terms, deadlines, responsibilities,
                restrictions, and potential risk areas are identified.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                3
              </div>

              <h3 className="text-lg font-semibold">
                Understand before signing
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Get a simple summary and clear explanations of the clauses
                that matter most to you as a tenant.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-20 max-w-2xl border-t pt-10">
          <p className="text-sm leading-6 text-muted-foreground">
            SamjhoSign helps you understand your agreement. It does not
            replace professional legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}