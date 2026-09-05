"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabase/client";

type LegalFinding = {
  title: string;
  status: string;
  severity: string;
  explanation: string;
  agreement_text: string;
  legal_reference: string;
  source: string;
  source_url: string;
};

type FinancialObligation = {
  title: string;
  amount: string;
  explanation: string;
};

type Deadline = {
  title: string;
  deadline: string;
  explanation: string;
};

type Risk = {
  title: string;
  severity: string;
  explanation: string;
  agreement_text: string;
};

type ImportantClause = {
  title: string;
  explanation: string;
  agreement_text: string;
};

type Analysis = {
  overall_risk: string;
  summary: string;
  financial_obligations: FinancialObligation[];
  deadlines: Deadline[];
  risks: Risk[];
  important_clauses: ImportantClause[];
  legal_findings: LegalFinding[];
};

type SavedAnalysis = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  text: string;
  analysis: Analysis;
};

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("analyses")
        .select(
          "id, created_at, filename, pages, text, analysis"
        )
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setAnalyses((data ?? []) as SavedAnalysis[]);
    } catch (err) {
      console.error("History loading error:", err);

      setError(
        "We couldn't load your saved analyses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("analyses")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setAnalyses((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        "The analysis could not be deleted. Please try again."
      );
    }
  }

  function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize = 10,
    lineHeight = 5
  ) {
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(
      text || "Not provided",
      maxWidth
    );

    let currentY = y;

    for (const line of lines) {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }

      doc.text(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  function addSectionTitle(
    doc: jsPDF,
    title: string,
    y: number
  ) {
    let currentY = y;

    if (currentY > 265) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, 20, currentY);

    return currentY + 9;
  }

  function addLabel(
    doc: jsPDF,
    label: string,
    value: string,
    y: number
  ) {
    let currentY = y;

    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, 20, currentY);

    doc.setFont("helvetica", "normal");

    return addWrappedText(
      doc,
      value,
      20,
      currentY + 6,
      170,
      10,
      5
    );
  }

  async function handleDownloadPDF(item: SavedAnalysis) {
    setDownloadingId(item.id);

    try {
      const doc = new jsPDF();

      let y = 20;

      /*
       * HEADER
       */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("SamjhoSign", 20, y);

      y += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "Rental Agreement Analysis Report",
        20,
        y
      );

      y += 12;

      doc.setDrawColor(220, 220, 220);
      doc.line(20, y, 190, y);

      y += 12;

      /*
       * AGREEMENT DETAILS
       */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Agreement Details", 20, y);

      y += 9;

      y = addLabel(
        doc,
        "Filename",
        item.filename,
        y
      );

      y += 3;

      y = addLabel(
        doc,
        "Pages",
        item.pages !== null
          ? String(item.pages)
          : "Not available",
        y
      );

      y += 3;

      y = addLabel(
        doc,
        "Analyzed",
        new Date(item.created_at).toLocaleString(),
        y
      );

      y += 8;

      /*
       * OVERALL RISK
       */

      y = addSectionTitle(
        doc,
        "Overall Risk",
        y
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        item.analysis.overall_risk || "Not available",
        20,
        y
      );

      y += 9;

      /*
       * SUMMARY
       */

      y = addSectionTitle(
        doc,
        "Plain-English Summary",
        y
      );

      doc.setFont("helvetica", "normal");

      y = addWrappedText(
        doc,
        item.analysis.summary,
        20,
        y,
        170,
        10,
        5
      );

      y += 8;

      /*
       * FINANCIAL OBLIGATIONS
       */

      y = addSectionTitle(
        doc,
        "Financial Obligations",
        y
      );

      if (
        !item.analysis.financial_obligations ||
        item.analysis.financial_obligations.length === 0
      ) {
        y = addWrappedText(
          doc,
          "No obvious financial obligations were detected.",
          20,
          y,
          170
        );

        y += 8;
      } else {
        item.analysis.financial_obligations.forEach(
          (obligation, index) => {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(
              `${index + 1}. ${obligation.title}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(
              `Amount: ${obligation.amount}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "normal");

            y = addWrappedText(
              doc,
              obligation.explanation,
              20,
              y,
              170
            );

            y += 7;
          }
        );
      }

      /*
       * DEADLINES
       */

      y = addSectionTitle(
        doc,
        "Important Deadlines",
        y
      );

      if (
        !item.analysis.deadlines ||
        item.analysis.deadlines.length === 0
      ) {
        y = addWrappedText(
          doc,
          "No obvious deadlines were detected.",
          20,
          y,
          170
        );

        y += 8;
      } else {
        item.analysis.deadlines.forEach(
          (deadline, index) => {
            if (y > 250) {
              doc.addPage();
              y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(
              `${index + 1}. ${deadline.title}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(
              `Deadline: ${deadline.deadline}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "normal");

            y = addWrappedText(
              doc,
              deadline.explanation,
              20,
              y,
              170
            );

            y += 7;
          }
        );
      }

      /*
       * RISKS
       */

      y = addSectionTitle(
        doc,
        "Risks",
        y
      );

      if (
        !item.analysis.risks ||
        item.analysis.risks.length === 0
      ) {
        y = addWrappedText(
          doc,
          "No major risk-related clauses were detected.",
          20,
          y,
          170
        );

        y += 8;
      } else {
        item.analysis.risks.forEach(
          (risk, index) => {
            if (y > 240) {
              doc.addPage();
              y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(
              `${index + 1}. ${risk.title}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(
              `Severity: ${risk.severity}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "normal");

            y = addWrappedText(
              doc,
              risk.explanation,
              20,
              y,
              170
            );

            if (risk.agreement_text) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(
                "Agreement wording:",
                20,
                y
              );

              y += 5;

              doc.setFont("helvetica", "italic");

              y = addWrappedText(
                doc,
                `"${risk.agreement_text}"`,
                25,
                y,
                165,
                9,
                4.5
              );

              doc.setFont("helvetica", "normal");
            }

            y += 8;
          }
        );
      }

      /*
       * TAMIL NADU LEGAL CHECK
       */

      y = addSectionTitle(
        doc,
        "Tamil Nadu Legal Check",
        y
      );

      y = addWrappedText(
        doc,
        "Informational comparison against selected Tamil Nadu tenancy references supplied to SamjhoSign.",
        20,
        y,
        170,
        9,
        4.5
      );

      y += 7;

      if (
        !item.analysis.legal_findings ||
        item.analysis.legal_findings.length === 0
      ) {
        y = addWrappedText(
          doc,
          "No specific Tamil Nadu legal findings were returned.",
          20,
          y,
          170
        );

        y += 8;
      } else {
        item.analysis.legal_findings.forEach(
          (finding, index) => {
            if (y > 230) {
              doc.addPage();
              y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(
              `${index + 1}. ${finding.title}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(
              `Status: ${finding.status}`,
              20,
              y
            );

            y += 5;

            doc.text(
              `Severity: ${finding.severity}`,
              20,
              y
            );

            y += 7;

            doc.setFont("helvetica", "normal");

            y = addWrappedText(
              doc,
              finding.explanation,
              20,
              y,
              170,
              10,
              5
            );

            if (finding.agreement_text) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(
                "Agreement wording:",
                20,
                y
              );

              y += 5;

              doc.setFont("helvetica", "italic");

              y = addWrappedText(
                doc,
                `"${finding.agreement_text}"`,
                25,
                y,
                165,
                9,
                4.5
              );

              doc.setFont("helvetica", "normal");
            }

            if (finding.legal_reference) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(
                "Legal reference:",
                20,
                y
              );

              y += 5;

              doc.setFont("helvetica", "normal");

              y = addWrappedText(
                doc,
                finding.legal_reference,
                20,
                y,
                170,
                9,
                4.5
              );
            }

            if (finding.source) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(
                "Source:",
                20,
                y
              );

              y += 5;

              doc.setFont("helvetica", "normal");

              y = addWrappedText(
                doc,
                finding.source,
                20,
                y,
                170,
                9,
                4.5
              );
            }

            if (finding.source_url) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(8);
              doc.text(
                "Official source:",
                20,
                y
              );

              y += 4;

              doc.setFont("helvetica", "normal");
              doc.setFontSize(7);

              const urlLines = doc.splitTextToSize(
                finding.source_url,
                170
              );

              for (const line of urlLines) {
                if (y > 275) {
                  doc.addPage();
                  y = 20;
                }

                doc.text(line, 20, y);
                y += 4;
              }
            }

            y += 9;
          }
        );
      }

      /*
       * IMPORTANT CLAUSES
       */

      y = addSectionTitle(
        doc,
        "Important Clauses",
        y
      );

      if (
        !item.analysis.important_clauses ||
        item.analysis.important_clauses.length === 0
      ) {
        y = addWrappedText(
          doc,
          "No specific important clauses were detected.",
          20,
          y,
          170
        );

        y += 8;
      } else {
        item.analysis.important_clauses.forEach(
          (clause, index) => {
            if (y > 240) {
              doc.addPage();
              y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(
              `${index + 1}. ${clause.title}`,
              20,
              y
            );

            y += 6;

            doc.setFont("helvetica", "normal");

            y = addWrappedText(
              doc,
              clause.explanation,
              20,
              y,
              170
            );

            if (clause.agreement_text) {
              y += 4;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(
                "Agreement wording:",
                20,
                y
              );

              y += 5;

              doc.setFont("helvetica", "italic");

              y = addWrappedText(
                doc,
                `"${clause.agreement_text}"`,
                25,
                y,
                165,
                9,
                4.5
              );

              doc.setFont("helvetica", "normal");
            }

            y += 8;
          }
        );
      }

      /*
       * DISCLAIMER
       */

      y = addSectionTitle(
        doc,
        "Disclaimer",
        y
      );

      y = addWrappedText(
        doc,
        "SamjhoSign provides an AI-powered explanation of rental agreements for informational purposes only. The Tamil Nadu Legal Check is an informational comparison against selected legal references and is not a legal opinion. SamjhoSign does not determine whether a clause is legally enforceable. For important legal decisions or disputes, consult a qualified legal professional.",
        20,
        y,
        170,
        9,
        4.5
      );

      /*
       * PAGE NUMBERS
       */

      const totalPages = doc.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.setTextColor(120, 120, 120);

        doc.text(
          `SamjhoSign · Page ${page} of ${totalPages}`,
          20,
          290
        );

        doc.setTextColor(0, 0, 0);
      }

      /*
       * DOWNLOAD
       */

      const safeFilename = item.filename
        .replace(/\.pdf$/i, "")
        .replace(/[^a-z0-9-_]+/gi, "_")
        .replace(/^_+|_+$/g, "");

      doc.save(
        `${safeFilename || "agreement"}_SamjhoSign_Report.pdf`
      );
    } catch (err) {
      console.error("PDF generation error:", err);

      setError(
        "The PDF could not be generated. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function getRiskBadgeClasses(risk: string) {
    const normalized = risk.toLowerCase();

    if (normalized === "high") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (normalized === "medium") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded-full bg-gray-200" />
            <div className="mt-4 h-12 w-64 rounded-xl bg-gray-200" />
            <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-gray-200" />
            <div className="mt-12 h-64 rounded-[2rem] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  const totalAnalyses = analyses.length;
  const totalLegalChecks = analyses.reduce(
    (sum, item) => sum + (item.analysis?.legal_findings?.length ?? 0),
    0
  );

  const highRiskCount = analyses.filter(
    (item) => item.analysis?.overall_risk?.toLowerCase() === "high"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">

        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-950" />
              Your workspace
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-gray-950 sm:text-6xl">
              My Analyses
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
              Your saved rental agreement reviews, risk insights, and
              Tamil Nadu legal checks — all in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl"
          >
            Analyze new agreement
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>

        {/* Stats */}
        {analyses.length > 0 && (
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                Total analyses
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                {totalAnalyses}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Saved to your account
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                TN legal checks
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                {totalLegalChecks}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Across your reports
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                High-risk reports
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                {highRiskCount}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Worth reviewing carefully
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-medium">{error}</p>

            <button
              type="button"
              onClick={loadAnalyses}
              className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {analyses.length === 0 && !error ? (
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
            <div className="relative px-6 py-16 text-center sm:px-16 sm:py-24">
              <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 rounded-full bg-gray-100 blur-3xl" />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-950 text-white shadow-xl">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2h9l3 3v17H6z" />
                  <path d="M14 2v4h4" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>
              </div>

              <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Nothing here yet
              </p>

              <h2 className="relative mt-2 text-3xl font-bold tracking-[-0.035em] text-gray-950">
                Your first analysis starts here.
              </h2>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
                Upload a rental agreement and we'll create a clear,
                tenant-friendly report for you.
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="relative mt-7 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Analyze an agreement →
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10">

            {/* List header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  Saved reports
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Most recent first
                </p>
              </div>

              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
                {totalAnalyses} {totalAnalyses === 1 ? "report" : "reports"}
              </span>
            </div>

            <div className="space-y-4">
              {analyses.map((item) => {
                const legalCount =
                  item.analysis?.legal_findings?.length ?? 0;

                const financialCount =
                  item.analysis?.financial_obligations?.length ?? 0;

                const riskCount =
                  item.analysis?.risks?.length ?? 0;

                const risk =
                  item.analysis?.overall_risk || "Unknown";

                const normalizedRisk = risk.toLowerCase();

                const riskConfig =
                  normalizedRisk === "high"
                    ? {
                        label: "High risk",
                        dot: "bg-red-500",
                        badge:
                          "border-red-200 bg-red-50 text-red-700",
                      }
                    : normalizedRisk === "medium"
                    ? {
                        label: "Medium risk",
                        dot: "bg-amber-500",
                        badge:
                          "border-amber-200 bg-amber-50 text-amber-700",
                      }
                    : normalizedRisk === "low"
                    ? {
                        label: "Low risk",
                        dot: "bg-emerald-500",
                        badge:
                          "border-emerald-200 bg-emerald-50 text-emerald-700",
                      }
                    : {
                        label: `${risk} risk`,
                        dot: "bg-gray-400",
                        badge:
                          "border-gray-200 bg-gray-50 text-gray-600",
                      };

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="p-5 sm:p-7">

                      {/* Top row */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-xs font-bold text-white shadow-sm">
                            PDF
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold tracking-[-0.02em] text-gray-950 sm:text-xl">
                              {item.filename}
                            </h2>

                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(item.created_at)}
                              {item.pages !== null
                                ? ` · ${item.pages} pages`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${riskConfig.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${riskConfig.dot}`}
                          />
                          {riskConfig.label}
                        </span>
                      </div>

                      {/* Summary */}
                      <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                          Summary
                        </p>

                        <p className="mt-2 max-w-4xl text-sm leading-7 text-gray-600">
                          {item.analysis?.summary ||
                            "No summary available."}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-xs text-gray-400">
                            Financial
                          </p>
                          <p className="mt-1 text-xl font-bold text-gray-950">
                            {financialCount}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-xs text-gray-400">
                            Risks
                          </p>
                          <p className="mt-1 text-xl font-bold text-gray-950">
                            {riskCount}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-xs text-gray-400">
                            TN checks
                          </p>
                          <p className="mt-1 text-xl font-bold text-gray-950">
                            {legalCount}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-xs text-gray-400">
                            Deadlines
                          </p>
                          <p className="mt-1 text-xl font-bold text-gray-950">
                            {item.analysis?.deadlines?.length ?? 0}
                          </p>
                        </div>

                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/history/${item.id}`)
                          }
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 hover:border-gray-300"
                        >
                          Open report
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadPDF(item)
                          }
                          disabled={downloadingId === item.id}
                          className="rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadingId === item.id
                            ? "Generating..."
                            : "Download PDF"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          Delete
                        </button>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
