"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type AnalysisData = {
  extracted_text?: string;
  overall_risk?: string;
  summary?: string;
  financial_obligations?: FinancialObligation[];
  deadlines?: Deadline[];
  risks?: Risk[];
  important_clauses?: ImportantClause[];
};

type SavedAnalysis = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  text: string | null;
  analysis: AnalysisData | null;
};

export default function AnalysisReportPage() {
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [report, setReport] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Please sign in to view this report.");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("analyses")
          .select(
            "id, created_at, filename, pages, text, analysis"
          )
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          console.error(fetchError);
          setError("This analysis could not be found.");
          setLoading(false);
          return;
        }

        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading the report.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadReport();
    }
  }, [id, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">
              Loading your report...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/history"
            className="text-sm font-medium text-gray-500 hover:text-gray-950"
          >
            ← Back to My analyses
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
            <h1 className="text-2xl font-bold text-red-800">
              Report unavailable
            </h1>

            <p className="mt-3 text-red-700">
              {error || "This analysis could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const analysis = report.analysis ?? {};

  const risk = analysis.overall_risk?.toLowerCase() ?? "unknown";

  const riskClass =
    risk === "high"
      ? "border-red-200 bg-red-50 text-red-700"
      : risk === "medium"
        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
        : "border-green-200 bg-green-50 text-green-700";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Top navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/history"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            ← Back to My analyses
          </Link>

          <Link
            href="/#upload-agreement"
            className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Analyze another agreement
          </Link>
        </div>

        {/* Header */}
        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-400">
                Rental agreement analysis
              </p>

              <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {report.filename}
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                {new Date(report.created_at).toLocaleString("en-IN")}
                {report.pages ? ` • ${report.pages} pages` : ""}
              </p>
            </div>

            <div
              className={`w-fit rounded-full border px-5 py-3 text-sm font-bold ${riskClass}`}
            >
              {analysis.overall_risk ?? "Unknown"} risk
            </div>
          </div>
        </div>

        {/* Summary */}
        {analysis.summary && (
          <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950">
              Summary
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              {analysis.summary}
            </p>
          </section>
        )}

        {/* Financial obligations */}
        {analysis.financial_obligations &&
          analysis.financial_obligations.length > 0 && (
            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-950">
                Financial obligations
              </h2>

              <div className="mt-6 space-y-4">
                {analysis.financial_obligations.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-bold text-gray-950">
                        {item.title}
                      </h3>

                      <span className="font-semibold text-gray-950">
                        {item.amount}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Deadlines */}
        {analysis.deadlines &&
          analysis.deadlines.length > 0 && (
            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-950">
                Deadlines
              </h2>

              <div className="mt-6 space-y-4">
                {analysis.deadlines.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-bold text-gray-950">
                        {item.title}
                      </h3>

                      <span className="font-semibold text-gray-950">
                        {item.deadline}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Risks */}
        {analysis.risks &&
          analysis.risks.length > 0 && (
            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-950">
                Potential risks
              </h2>

              <div className="mt-6 space-y-5">
                {analysis.risks.map((item, index) => {
                  const severity = item.severity?.toLowerCase() ?? "";

                  const severityClass =
                    severity === "high"
                      ? "bg-red-100 text-red-700"
                      : severity === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 p-6"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-bold text-gray-950">
                          {item.title}
                        </h3>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${severityClass}`}
                        >
                          {item.severity}
                        </span>
                      </div>

                      <p className="mt-4 leading-6 text-gray-600">
                        {item.explanation}
                      </p>

                      {item.agreement_text && (
                        <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Agreement wording
                          </p>

                          <p className="mt-2 text-sm italic leading-6 text-gray-700">
                            “{item.agreement_text}”
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* Important clauses */}
        {analysis.important_clauses &&
          analysis.important_clauses.length > 0 && (
            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-950">
                Important clauses
              </h2>

              <div className="mt-6 space-y-5">
                {analysis.important_clauses.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 leading-6 text-gray-600">
                      {item.explanation}
                    </p>

                    {item.agreement_text && (
                      <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Agreement wording
                        </p>

                        <p className="mt-2 text-sm italic leading-6 text-gray-700">
                          “{item.agreement_text}”
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Extracted agreement */}
        {(report.text || analysis.extracted_text) && (
          <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950">
              Extracted agreement
            </h2>

            <div className="mt-6 max-h-[600px] overflow-y-auto rounded-2xl bg-gray-50 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-600">
                {report.text || analysis.extracted_text}
              </pre>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-sm leading-6 text-gray-500">
          <strong className="text-gray-700">
            Important:
          </strong>{" "}
          SamjhoSign provides AI-assisted agreement analysis for
          informational purposes only. It is not legal advice and
          should not replace advice from a qualified legal professional.
        </div>

        <div className="h-12" />
      </div>
    </main>
  );
}