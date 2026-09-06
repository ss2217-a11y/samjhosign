"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type AskSamjhoSignProps = {
  agreementText: string;
};

export default function AskSamjhoSign({
  agreementText,
}: AskSamjhoSignProps) {
  const supabase = createClient();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/auth/login";
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";

      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          agreement_text: agreementText,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "SamjhoSign could not answer that question."
        );
      }

      setAnswer(data.answer || "No answer was returned.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuestion();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className="no-print overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 bg-gray-50/80 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-lg text-white shadow-sm">
            ✨
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Ask SamjhoSign
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-950">
              Ask anything about this agreement.
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Get a plain-English answer based on the agreement you uploaded.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            rows={3}
            disabled={loading}
            placeholder="e.g. Can I terminate this agreement early?"
            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60"
          />

          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-2">
            <span className="text-xs text-gray-400">
              Enter to ask · Shift + Enter for a new line
            </span>

            <button
              type="button"
              onClick={askQuestion}
              disabled={!question.trim() || loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Thinking...
                </>
              ) : (
                <>Ask <span>→</span></>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                ✦
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  SamjhoSign
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <p className="mt-4 text-xs leading-5 text-gray-400">
          AI-generated explanations are informational only and are not legal advice.
        </p>
      </div>
    </motion.section>
  );
}
