 "use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabase/client";

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

type Analysis = {
  overall_risk: string;
  summary: string;
  financial_obligations: FinancialObligation[];
  deadlines: Deadline[];
  risks: Risk[];
  important_clauses: ImportantClause[];
  legal_findings: LegalFinding[];
};

type Report = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  text: string;
  analysis: Analysis;
};

function cleanText(value: string | null | undefined) {
  return (value || "")
    .replace(/₹/g, "Rs.")
    .replace(/■/g, "Rs.")
    .trim();
}

function riskClass(value: string) {
  const risk = value.toLowerCase();

  if (
    risk.includes("high") ||
    risk.includes("critical") ||
    risk.includes("potentially inconsistent")
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (
    risk.includes("medium") ||
    risk.includes("attention")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function legalClass(value: string) {
  const status = value.toLowerCase();

  if (status.includes("potentially inconsistent")) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status.includes("attention")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status.includes("not enough")) {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function SavedReportPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("summary");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("analyses")
        .select("id, created_at, filename, pages, text, analysis")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("We couldn't find this analysis.");
        setLoading(false);
        return;
      }

      setReport(data as Report);
      setLoading(false);
    }

    loadReport();
  }, [id, router, supabase]);

  useEffect(() => {
    if (!report) return;

    const sections = [
      "summary",
      "financial",
      "deadlines",
      "risks",
      "legal-check",
      "clauses",
      "agreement-text",
    ];

    const elements = sections
      .map((section) => document.getElementById(section))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [report]);

  const stats = useMemo(() => {
    if (!report) {
      return {
        financial: 0,
        deadlines: 0,
        risks: 0,
        legal: 0,
        clauses: 0,
      };
    }

    return {
      financial: report.analysis.financial_obligations?.length || 0,
      deadlines: report.analysis.deadlines?.length || 0,
      risks: report.analysis.risks?.length || 0,
      legal: report.analysis.legal_findings?.length || 0,
      clauses: report.analysis.important_clauses?.length || 0,
    };
  }, [report]);

  function pdfSafeText(value: string) {
    return cleanText(value).replace(/[^\x00-\x7F]/g, "");
  }

  function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 5
  ) {
    const lines = doc.splitTextToSize(pdfSafeText(text), maxWidth);

    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, x, y);
      y += lineHeight;
    }

    return y;
  }

  async function downloadPDF() {
    if (!report) return;

    setDownloading(true);

    try {
      const doc = new jsPDF();
      const analysis = report.analysis;

      let y = 20;

      doc.setFontSize(22);
      doc.text("SamjhoSign", 20, y);
      y += 9;

      doc.setFontSize(10);
      doc.text("Rental Agreement Analysis Report", 20, y);
      y += 12;

      doc.setFontSize(12);
      doc.text(pdfSafeText(report.filename), 20, y);
      y += 6;

      doc.setFontSize(9);
      doc.text(
        `Analyzed: ${new Date(report.created_at).toLocaleString("en-IN")}`,
        20,
        y
      );
      y += 6;

      if (report.pages) {
        doc.text(`Pages: ${report.pages}`, 20, y);
        y += 10;
      }

      doc.setFontSize(14);
      doc.text(
        `Overall Risk: ${pdfSafeText(analysis.overall_risk)}`,
        20,
        y
      );
      y += 9;

      doc.setFontSize(11);
      doc.text("Summary", 20, y);
      y += 7;

      doc.setFontSize(9);
      y = addWrappedText(
        doc,
        analysis.summary,
        20,
        y,
        170,
        5
      );
      y += 6;

      if (analysis.financial_obligations?.length) {
        doc.setFontSize(11);
        doc.text("Financial Obligations", 20, y);
        y += 7;

        doc.setFontSize(9);

        for (const item of analysis.financial_obligations) {
          y = addWrappedText(
            doc,
            `${item.title}: ${item.amount}`,
            20,
            y,
            170
          );

          y = addWrappedText(
            doc,
            item.explanation,
            25,
            y,
            165
          );

          y += 3;
        }
      }

      if (analysis.deadlines?.length) {
        doc.setFontSize(11);
        doc.text("Deadlines", 20, y);
        y += 7;

        doc.setFontSize(9);

        for (const item of analysis.deadlines) {
          y = addWrappedText(
            doc,
            `${item.title}: ${item.deadline}`,
            20,
            y,
            170
          );

          y = addWrappedText(
            doc,
            item.explanation,
            25,
            y,
            165
          );

          y += 3;
        }
      }

      if (analysis.risks?.length) {
        doc.setFontSize(11);
        doc.text("Risks", 20, y);
        y += 7;

        doc.setFontSize(9);

        for (const item of analysis.risks) {
          y = addWrappedText(
            doc,
            `${item.title} — ${item.severity}`,
            20,
            y,
            170
          );

          y = addWrappedText(
            doc,
            item.explanation,
            25,
            y,
            165
          );

          y = addWrappedText(
            doc,
            `Agreement wording: ${cleanText(item.agreement_text)}`,
            25,
            y,
            165
          );

          y += 3;
        }
      }

      if (analysis.legal_findings?.length) {
        doc.setFontSize(11);
        doc.text("Tamil Nadu Legal Check", 20, y);
        y += 7;

        doc.setFontSize(9);

        for (const item of analysis.legal_findings) {
          y = addWrappedText(
            doc,
            `${item.title} — ${item.status}`,
            20,
            y,
            170
          );

          y = addWrappedText(
            doc,
            item.explanation,
            25,
            y,
            165
          );

          y = addWrappedText(
            doc,
            `Agreement wording: ${cleanText(item.agreement_text)}`,
            25,
            y,
            165
          );

          y = addWrappedText(
            doc,
            `Reference: ${item.legal_reference}`,
            25,
            y,
            165
          );

          y += 3;
        }
      }

      if (analysis.important_clauses?.length) {
        doc.setFontSize(11);
        doc.text("Important Clauses", 20, y);
        y += 7;

        doc.setFontSize(9);

        for (const item of analysis.important_clauses) {
          y = addWrappedText(
            doc,
            item.title,
            20,
            y,
            170
          );

          y = addWrappedText(
            doc,
            item.explanation,
            25,
            y,
            165
          );

          y = addWrappedText(
            doc,
            `Agreement wording: ${cleanText(item.agreement_text)}`,
            25,
            y,
            165
          );

          y += 3;
        }
      }

      doc.addPage();
      y = 20;

      doc.setFontSize(12);
      doc.text("Extracted Agreement", 20, y);
      y += 8;

      doc.setFontSize(8);
      y = addWrappedText(
        doc,
        report.text,
        20,
        y,
        170,
        4
      );

      const totalPages = doc.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.text(
          `SamjhoSign • Page ${page} of ${totalPages}`,
          20,
          290
        );
      }

      const safeName =
        report.filename
          .replace(/\.pdf$/i, "")
          .replace(/[^a-z0-9-_]+/gi, "_")
          .slice(0, 80) || "agreement";

      doc.save(`${safeName}_SamjhoSign_Report.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />
            <p className="mt-4 text-sm text-gray-500">
              Loading your analysis...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">?</div>
            <h1 className="mt-4 text-2xl font-semibold">
              Report not found
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error || "This analysis may have been deleted."}
            </p>

            <button
              onClick={() => router.push("/history")}
              className="mt-6 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Back to My Analyses
            </button>
          </div>
        </div>
      </main>
    );
  }

  const navigation = [
    { id: "summary", label: "Summary" },
    { id: "financial", label: "Money" },
    { id: "deadlines", label: "Deadlines" },
    { id: "risks", label: "Risks" },
    { id: "legal-check", label: "TN Legal Check" },
    { id: "clauses", label: "Clauses" },
    { id: "agreement-text", label: "Agreement" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="min-w-0">
            <button
              onClick={() => router.push("/history")}
              className="mb-3 text-sm font-medium text-gray-500 hover:text-gray-950"
            >
              ← My Analyses
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white">
                S
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {report.filename}
                </h1>

                <p className="mt-1 text-xs text-gray-500">
                  {report.pages
                    ? `${report.pages} pages`
                    : "PDF agreement"}{" "}
                  •{" "}
                  {new Date(report.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="shrink-0 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {downloading ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </header>

      {/* REPORT NAV */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8">
          <nav className="flex min-w-max gap-1 py-3">
            {navigation.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-gray-950 font-semibold text-white"
                      : "font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                >
                  {item.id === "legal-check" && "🇮🇳 "}
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">

        {/* SUMMARY */}
        <section id="summary" className="scroll-mt-28">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Analysis overview
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
                  Your agreement at a glance
                </h2>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  {cleanText(report.analysis.summary)}
                </p>
              </div>

              <div
                className={`shrink-0 rounded-2xl border px-5 py-4 ${riskClass(
                  report.analysis.overall_risk
                )}`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Overall risk
                </div>

                <div className="mt-1 text-xl font-bold">
                  {report.analysis.overall_risk}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["Money", stats.financial],
                ["Deadlines", stats.deadlines],
                ["Risks", stats.risks],
                ["Legal checks", stats.legal],
                ["Clauses", stats.clauses],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-gray-50 p-4"
                >
                  <div className="text-2xl font-bold">
                    {value}
                  </div>

                  <div className="mt-1 text-xs font-medium text-gray-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINANCIAL */}
        <section
          id="financial"
          className="mt-8 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Money
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Financial obligations
            </h2>
          </div>

          {stats.financial === 0 ? (
            <EmptyCard text="No financial obligations were identified." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {report.analysis.financial_obligations.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold">
                        {cleanText(item.amount)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {cleanText(item.explanation)}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* DEADLINES */}
        <section
          id="deadlines"
          className="mt-10 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Important dates
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Deadlines
            </h2>
          </div>

          {stats.deadlines === 0 ? (
            <EmptyCard text="No specific deadlines were identified." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {report.analysis.deadlines.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-xs font-bold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <div className="mt-1 text-sm font-semibold text-gray-950">
                          {cleanText(item.deadline)}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {cleanText(item.explanation)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* RISKS */}
        <section
          id="risks"
          className="mt-10 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Review carefully
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Risks
            </h2>
          </div>

          {stats.risks === 0 ? (
            <EmptyCard text="No major risks were identified." />
          ) : (
            <div className="space-y-4">
              {report.analysis.risks.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-lg font-semibold">
                      {item.title}
                    </h3>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${riskClass(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {cleanText(item.explanation)}
                  </p>

                  {item.agreement_text && (
                    <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Agreement wording
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        “{cleanText(item.agreement_text)}”
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LEGAL CHECK */}
        <section
          id="legal-check"
          className="mt-10 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Tamil Nadu
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              🇮🇳 Tamil Nadu Legal Check
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Relevant tenancy-law considerations identified from your
              agreement. This is informational and is not legal advice.
            </p>
          </div>

          {stats.legal === 0 ? (
            <EmptyCard text="No specific legal findings were identified." />
          ) : (
            <div className="space-y-4">
              {report.analysis.legal_findings.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.title}
                        </h3>

                        {item.legal_reference && (
                          <p className="mt-1 text-xs text-gray-400">
                            {item.legal_reference}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${legalClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        {item.severity && (
                          <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${riskClass(
                              item.severity
                            )}`}
                          >
                            {item.severity}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      {cleanText(item.explanation)}
                    </p>

                    {item.agreement_text && (
                      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Agreement wording
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          “{cleanText(item.agreement_text)}”
                        </p>
                      </div>
                    )}

                    {item.source && (
                      <div className="mt-4 text-xs text-gray-400">
                        Source: {item.source}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* CLAUSES */}
        <section
          id="clauses"
          className="mt-10 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Key terms
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Important clauses
            </h2>
          </div>

          {stats.clauses === 0 ? (
            <EmptyCard text="No additional important clauses were identified." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {report.analysis.important_clauses.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {cleanText(item.explanation)}
                    </p>

                    {item.agreement_text && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Agreement wording
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          “{cleanText(item.agreement_text)}”
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* AGREEMENT TEXT */}
        <section
          id="agreement-text"
          className="mt-10 scroll-mt-28"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Original document
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Extracted agreement
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div className="text-xs font-medium text-gray-500">
                Extracted text from {report.filename}
              </div>
            </div>

            <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap break-words p-6 font-sans text-sm leading-7 text-gray-700">
              {cleanText(report.text)}
            </pre>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 text-xs leading-6 text-gray-500">
          <strong className="text-gray-700">
            Important:
          </strong>{" "}
          SamjhoSign provides AI-assisted informational analysis of rental
          agreements. It does not provide legal advice, does not establish an
          advocate-client relationship, and should not replace advice from a
          qualified legal professional.
        </div>

        {/* FINAL CTA */}
        <div className="mt-8 rounded-3xl bg-gray-950 p-7 text-white sm:p-9">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              SamjhoSign
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Need to check another agreement?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Upload another rental agreement and get a fresh analysis.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
            >
              Analyze another agreement
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
