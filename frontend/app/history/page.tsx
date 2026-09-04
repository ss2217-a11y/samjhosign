"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";

type FinancialObligation = {
  title?: string;
  amount?: string;
  explanation?: string;
};

type Deadline = {
  title?: string;
  deadline?: string;
  explanation?: string;
};

type Risk = {
  title?: string;
  severity?: string;
  explanation?: string;
  agreement_text?: string;
};

type ImportantClause = {
  title?: string;
  explanation?: string;
  agreement_text?: string;
};

type AnalysisData = {
  overall_risk?: string;
  summary?: string;
  financial_obligations?: FinancialObligation[];
  deadlines?: Deadline[];
  risks?: Risk[];
  important_clauses?: ImportantClause[];
};

type Analysis = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  analysis: AnalysisData | null;
};

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Please sign in to view your analysis history.");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("analyses")
          .select("id, created_at, filename, pages, analysis")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error(fetchError);
          setError("Could not load your analysis history.");
          setLoading(false);
          return;
        }

        setAnalyses(data ?? []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, [supabase]);

  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
    filename: string
  ) {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${filename}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("analyses")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error(deleteError);
        setError("Could not delete this analysis.");
        setDeletingId(null);
        return;
      }

      setAnalyses((current) =>
        current.filter((analysis) => analysis.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong while deleting the analysis.");
    } finally {
      setDeletingId(null);
    }
  }

  function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 6
  ) {
    const lines = doc.splitTextToSize(text, maxWidth);

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

  function addSectionTitle(
    doc: jsPDF,
    title: string,
    y: number
  ) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 20, y);

    return y + 9;
  }

  async function handleDownloadPDF(
    event: React.MouseEvent<HTMLButtonElement>,
    item: Analysis
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDownloadingId(item.id);
    setError("");

    try {
      const doc = new jsPDF();

      const analysis = item.analysis ?? {};
      const risk = analysis.overall_risk ?? "Unknown";

      // ----------------------------------------------------
      // HEADER
      // ----------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("SamjhoSign", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "Rental Agreement Analysis Report",
        20,
        32
      );

      // Divider
      doc.line(20, 38, 190, 38);

      // ----------------------------------------------------
      // AGREEMENT DETAILS
      // ----------------------------------------------------

      let y = 50;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Agreement", 20, y);

      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      y = addWrappedText(
        doc,
        item.filename,
        20,
        y,
        170
      );

      y += 2;

      y = addWrappedText(
        doc,
        `Analyzed: ${new Date(
          item.created_at
        ).toLocaleString("en-IN")}`,
        20,
        y,
        170
      );

      if (item.pages) {
        y = addWrappedText(
          doc,
          `Pages: ${item.pages}`,
          20,
          y,
          170
        );
      }

      y += 5;

      // ----------------------------------------------------
      // OVERALL RISK
      // ----------------------------------------------------

      y = addSectionTitle(
        doc,
        "Overall Risk",
        y
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${risk} risk`, 20, y);

      y += 12;

      // ----------------------------------------------------
      // SUMMARY
      // ----------------------------------------------------

      if (analysis.summary) {
        y = addSectionTitle(
          doc,
          "Summary",
          y
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        y = addWrappedText(
          doc,
          analysis.summary,
          20,
          y,
          170
        );

        y += 6;
      }

      // ----------------------------------------------------
      // FINANCIAL OBLIGATIONS
      // ----------------------------------------------------

      if (
        analysis.financial_obligations &&
        analysis.financial_obligations.length > 0
      ) {
        y = addSectionTitle(
          doc,
          "Financial Obligations",
          y
        );

        for (const obligation of analysis.financial_obligations) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);

          y = addWrappedText(
            doc,
            obligation.title ?? "Financial obligation",
            20,
            y,
            170
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          if (obligation.amount) {
            y = addWrappedText(
              doc,
              `Amount: ${obligation.amount}`,
              25,
              y,
              165
            );
          }

          if (obligation.explanation) {
            y = addWrappedText(
              doc,
              obligation.explanation,
              25,
              y,
              165
            );
          }

          y += 4;
        }
      }

      // ----------------------------------------------------
      // DEADLINES
      // ----------------------------------------------------

      if (
        analysis.deadlines &&
        analysis.deadlines.length > 0
      ) {
        y = addSectionTitle(
          doc,
          "Deadlines",
          y
        );

        for (const deadline of analysis.deadlines) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);

          y = addWrappedText(
            doc,
            deadline.title ?? "Deadline",
            20,
            y,
            170
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          if (deadline.deadline) {
            y = addWrappedText(
              doc,
              `Deadline: ${deadline.deadline}`,
              25,
              y,
              165
            );
          }

          if (deadline.explanation) {
            y = addWrappedText(
              doc,
              deadline.explanation,
              25,
              y,
              165
            );
          }

          y += 4;
        }
      }

      // ----------------------------------------------------
      // RISKS
      // ----------------------------------------------------

      if (
        analysis.risks &&
        analysis.risks.length > 0
      ) {
        y = addSectionTitle(
          doc,
          "Potential Risks",
          y
        );

        for (const riskItem of analysis.risks) {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);

          y = addWrappedText(
            doc,
            `${riskItem.title ?? "Risk"} — ${
              riskItem.severity ?? "Unknown"
            }`,
            20,
            y,
            170
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          if (riskItem.explanation) {
            y = addWrappedText(
              doc,
              riskItem.explanation,
              25,
              y,
              165
            );
          }

          if (riskItem.agreement_text) {
            y += 2;

            doc.setFont("helvetica", "italic");

            y = addWrappedText(
              doc,
              `Agreement wording: "${riskItem.agreement_text}"`,
              25,
              y,
              165
            );

            doc.setFont("helvetica", "normal");
          }

          y += 5;
        }
      }

      // ----------------------------------------------------
      // IMPORTANT CLAUSES
      // ----------------------------------------------------

      if (
        analysis.important_clauses &&
        analysis.important_clauses.length > 0
      ) {
        y = addSectionTitle(
          doc,
          "Important Clauses",
          y
        );

        for (const clause of analysis.important_clauses) {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);

          y = addWrappedText(
            doc,
            clause.title ?? "Important clause",
            20,
            y,
            170
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          if (clause.explanation) {
            y = addWrappedText(
              doc,
              clause.explanation,
              25,
              y,
              165
            );
          }

          if (clause.agreement_text) {
            y += 2;

            doc.setFont("helvetica", "italic");

            y = addWrappedText(
              doc,
              `Agreement wording: "${clause.agreement_text}"`,
              25,
              y,
              165
            );

            doc.setFont("helvetica", "normal");
          }

          y += 5;
        }
      }

      // ----------------------------------------------------
      // DISCLAIMER
      // ----------------------------------------------------

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Disclaimer", 20, y);

      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      y = addWrappedText(
        doc,
        "SamjhoSign provides AI-generated information to help users understand rental agreements. This report is not legal advice and should not be treated as a substitute for advice from a qualified legal professional.",
        20,
        y,
        170,
        5
      );

      // ----------------------------------------------------
      // FOOTER / PAGE NUMBERS
      // ----------------------------------------------------

      const totalPages = doc.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          `SamjhoSign • Page ${page} of ${totalPages}`,
          20,
          290
        );
      }

      // ----------------------------------------------------
      // DOWNLOAD
      // ----------------------------------------------------

      const safeFilename = item.filename
        .replace(/\.pdf$/i, "")
        .replace(/[^a-z0-9_-]+/gi, "_")
        .replace(/^_+|_+$/g, "");

      doc.save(
        `${safeFilename || "rental-agreement"}_SamjhoSign_Report.pdf`
      );
    } catch (err) {
      console.error(err);
      setError("Could not generate the PDF report.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-950"
            >
              ← Back to SamjhoSign
            </Link>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950">
              My analyses
            </h1>

            <p className="mt-2 text-gray-500">
              View your previously analyzed rental agreements.
            </p>
          </div>

          <Link
            href="/#upload-agreement"
            className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Analyze new agreement
          </Link>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading your analyses...
            </p>
          </div>
        )}

        {/* Not signed in */}
        {!loading &&
          error ===
            "Please sign in to view your analysis history." && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <Link
                href="/auth/login"
                className="inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
            </div>
          )}

        {/* Empty state */}
        {!loading &&
          error !==
            "Please sign in to view your analysis history." &&
          analyses.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                📄
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-950">
                No analyses yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Upload your first rental agreement and SamjhoSign
                will analyze the important money, deadlines,
                clauses, and risks.
              </p>

              <Link
                href="/#upload-agreement"
                className="mt-7 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Analyze my first agreement
              </Link>
            </div>
          )}

        {/* Analysis list */}
        {!loading &&
          error !==
            "Please sign in to view your analysis history." &&
          analyses.length > 0 && (
            <div className="space-y-4">
              {analyses.map((item) => {
                const risk =
                  item.analysis?.overall_risk?.toLowerCase() ??
                  "unknown";

                const riskClass =
                  risk === "high"
                    ? "bg-red-100 text-red-700"
                    : risk === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700";

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                  >
                    <Link
                      href={`/history/${item.id}`}
                      className="block"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="truncate text-xl font-bold text-gray-950">
                            {item.filename}
                          </h2>

                          <p className="mt-2 text-sm text-gray-500">
                            {new Date(
                              item.created_at
                            ).toLocaleString("en-IN")}
                            {item.pages
                              ? ` • ${item.pages} pages`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${riskClass}`}
                          >
                            {item.analysis?.overall_risk ??
                              "Unknown"}{" "}
                            risk
                          </span>

                          <span className="hidden text-sm font-semibold text-gray-500 sm:block">
                            View report →
                          </span>
                        </div>
                      </div>

                      {item.analysis?.summary && (
                        <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-600">
                          {item.analysis.summary}
                        </p>
                      )}

                      <div className="mt-5 text-sm font-semibold text-gray-950 sm:hidden">
                        View full report →
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/history/${item.id}`
                            )
                          }
                          className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
                        >
                          Open report
                        </button>

                        <button
                          type="button"
                          disabled={
                            downloadingId === item.id
                          }
                          onClick={(event) =>
                            handleDownloadPDF(
                              event,
                              item
                            )
                          }
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {downloadingId === item.id
                            ? "Creating PDF..."
                            : "Download PDF"}
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={(event) =>
                          handleDelete(
                            event,
                            item.id,
                            item.filename
                          )
                        }
                        className="w-fit rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}