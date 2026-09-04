"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Analysis = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  analysis: {
    overall_risk?: string;
    summary?: string;
  } | null;
};

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        {!loading && error === "Please sign in to view your analysis history." && (
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
          error !== "Please sign in to view your analysis history." &&
          analyses.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                📄
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-950">
                No analyses yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Upload your first rental agreement and SamjhoSign will analyze
                the important money, deadlines, clauses, and risks.
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
          error !== "Please sign in to view your analysis history." &&
          analyses.length > 0 && (
            <div className="space-y-4">
              {analyses.map((item) => {
                const risk =
                  item.analysis?.overall_risk?.toLowerCase() ?? "unknown";

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
                            {new Date(item.created_at).toLocaleString("en-IN")}
                            {item.pages
                              ? ` • ${item.pages} pages`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${riskClass}`}
                          >
                            {item.analysis?.overall_risk ?? "Unknown"} risk
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
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/history/${item.id}`)
                        }
                        className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
                      >
                        Open report
                      </button>

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
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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