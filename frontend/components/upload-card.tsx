"use client";

import { useRef, useState } from "react";
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

type Analysis = {
  overall_risk: string;
  summary: string;
  financial_obligations: FinancialObligation[];
  deadlines: Deadline[];
  risks: Risk[];
  important_clauses: ImportantClause[];
};

type Result = {
  filename: string;
  pages: number | null;
  text: string;
  analysis: Analysis;
};

export default function UploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  function processFile(selectedFile: File) {
    setError("");
    setResult(null);
    setSaveMessage("");

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("The PDF must be smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
  }

  function handleChooseFile() {
    if (isAnalyzing) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!isAnalyzing) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isAnalyzing) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    processFile(droppedFile);
  }

  function handleStartOver() {
    setFile(null);
    setResult(null);
    setError("");
    setSaveMessage("");
    setLoadingStep(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAnalysisToSupabase(data: Result) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveMessage(
          "Analysis completed. Sign in to save this report to your history."
        );
        return;
      }

      const { error: saveError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          filename: data.filename,
          pages: data.pages,
          text: data.text,
          analysis: data.analysis,
        });

      if (saveError) {
        console.error("Supabase save error:", saveError);

        setSaveMessage(
          "Analysis completed, but the report could not be saved."
        );

        return;
      }

      setSaveMessage("✓ Analysis saved to your account.");
    } catch (err) {
      console.error("Save analysis error:", err);

      setSaveMessage(
        "Analysis completed, but the report could not be saved."
      );
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep(0);
    setError("");
    setSaveMessage("");
    setResult(null);

    const stepTimer1 = setTimeout(() => {
      setLoadingStep(1);
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(2);
    }, 3000);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep(3);
    }, 5000);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLoadingStep(4);
      setResult(data);

      await saveAnalysisToSupabase(data);

      setTimeout(() => {
        document
          .getElementById("analysis-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the agreement."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setIsAnalyzing(false);
    }
  }

  function handlePrintReport() {
    window.print();
  }

  function getRiskStyles(risk: string) {
    const normalizedRisk = risk.toLowerCase();

    if (normalizedRisk === "high") {
      return {
        container: "border-red-200 bg-red-50",
        icon: "bg-red-100 text-red-700",
        text: "text-red-700",
        label: "High Risk",
      };
    }

    if (normalizedRisk === "medium") {
      return {
        container: "border-amber-200 bg-amber-50",
        icon: "bg-amber-100 text-amber-700",
        text: "text-amber-700",
        label: "Medium Risk",
      };
    }

    return {
      container: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
      label: "Low Risk",
    };
  }

  const loadingMessages = [
    {
      title: "Reading your agreement",
      description:
        "Extracting the text from your rental agreement.",
    },
    {
      title: "Finding important clauses",
      description:
        "Looking for terms that may affect you as a tenant.",
    },
    {
      title: "Checking financial obligations",
      description:
        "Reviewing rent, deposits, fees and other payments.",
    },
    {
      title: "Preparing your summary",
      description:
        "Turning the agreement into simple, understandable language.",
    },
  ];

  const highRiskCount =
    result?.analysis.risks.filter(
      (item) => item.severity.toLowerCase() === "high"
    ).length ?? 0;

  const mediumRiskCount =
    result?.analysis.risks.filter(
      (item) => item.severity.toLowerCase() === "medium"
    ).length ?? 0;

  const lowRiskCount =
    result?.analysis.risks.filter(
      (item) => item.severity.toLowerCase() === "low"
    ).length ?? 0;

  const totalRiskCount = result?.analysis.risks.length ?? 0;

  const financialCount =
    result?.analysis.financial_obligations.length ?? 0;

  const deadlineCount =
    result?.analysis.deadlines.length ?? 0;

  const clauseCount =
    result?.analysis.important_clauses.length ?? 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file && !isAnalyzing && !result && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseFile}
          className={`group mx-auto max-w-3xl cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 sm:p-14 ${
            isDragging
              ? "scale-[1.01] border-black bg-gray-50"
              : "border-gray-300 bg-white hover:border-gray-500 hover:bg-gray-50"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-1">
            ↑
          </div>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Drop your agreement here
          </h2>

          <p className="mt-2 text-gray-500">
            or click anywhere here to choose a PDF
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              PDF only
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Maximum 10 MB
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Secure analysis
            </span>
          </div>
        </div>
      )}

      {file && !result && !isAnalyzing && (
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                📄
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-gray-900">
                  {file.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  PDF · {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
                Ready
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              className="rounded-2xl bg-black px-8 py-4 text-lg font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
            >
              Analyze Agreement
            </button>

            <button
              type="button"
              onClick={handleChooseFile}
              className="rounded-2xl border border-gray-300 bg-white px-6 py-4 text-lg font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Choose a different file
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Analysis may take a few moments depending on the agreement
            length.
          </p>
        </div>
      )}

      {isAnalyzing && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                <span className="text-2xl">📄</span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-gray-900">
                Analyzing your agreement
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                SamjhoSign is carefully reviewing your rental agreement.
                This may take a few moments.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {loadingMessages.map((message, index) => {
                const isComplete = loadingStep > index;
                const isCurrent = loadingStep === index;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                      isCurrent
                        ? "border-gray-300 bg-gray-50"
                        : isComplete
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        "✓"
                      ) : isCurrent ? (
                        <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="text-left">
                      <p
                        className={`font-medium ${
                          isCurrent
                            ? "text-gray-900"
                            : isComplete
                            ? "text-emerald-800"
                            : "text-gray-400"
                        }`}
                      >
                        {message.title}
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          isCurrent
                            ? "text-gray-500"
                            : isComplete
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        {message.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-xs leading-5 text-gray-500">
                🔒 Your agreement is being processed securely for this
                analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
          <p className="font-medium">Something went wrong</p>

          <p className="mt-1 text-sm">{error}</p>

          {!isAnalyzing && (
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {result && (
        <div
          id="analysis-results"
          className="mt-12 scroll-mt-24 space-y-6"
        >
          <div className="no-print flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handlePrintReport}
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              🖨 Save as PDF
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Analyze another
            </button>
          </div>

          {saveMessage && (
            <div
              className={`rounded-2xl border p-4 text-center text-sm font-medium ${
                saveMessage.startsWith("✓")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {saveMessage}
            </div>
          )}

          <div className="hidden print:block">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              SamjhoSign
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Rental Agreement Analysis
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {result.filename}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-emerald-900">
                    Agreement analyzed successfully
                  </p>

                  <p className="mt-1 truncate text-sm text-emerald-700">
                    {result.filename}
                  </p>

                  {result.pages !== null && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {result.pages} pages analyzed
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartOver}
                className="no-print rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
              >
                Analyze another
              </button>
            </div>
          </div>

          <div className="no-print sticky top-16 z-40 -mx-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            <div className="flex min-w-max items-center gap-1">
              <a
                href="#summary"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Summary
              </a>

              <a
                href="#financial"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Money
              </a>

              <a
                href="#deadlines"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Deadlines
              </a>

              <a
                href="#risks"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Risks
              </a>

              <a
                href="#clauses"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Clauses
              </a>

              <a
                href="#agreement-text"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Agreement
              </a>
            </div>
          </div>

          <div id="summary" className="scroll-mt-36">
            {(() => {
              const riskStyles = getRiskStyles(
                result.analysis.overall_risk
              );

              return (
                <div
                  className={`overflow-hidden rounded-3xl border p-7 shadow-sm sm:p-8 ${riskStyles.container}`}
                >
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                        Agreement overview
                      </p>

                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                        Here&apos;s what you need to know.
                      </h2>

                      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                        SamjhoSign reviewed the agreement and highlighted
                        terms that may matter to you before signing.
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white/70 p-4">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${riskStyles.icon}`}
                      >
                        {result.analysis.overall_risk.toLowerCase() ===
                        "low"
                          ? "✓"
                          : "!"}
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Overall risk
                        </p>

                        <p
                          className={`mt-1 text-2xl font-bold ${riskStyles.text}`}
                        >
                          {riskStyles.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="#financial"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">💰</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Money
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-gray-950">
                {financialCount}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                financial obligations
              </p>

              <p className="mt-4 text-xs font-medium text-gray-400 transition group-hover:text-gray-700">
                View details →
              </p>
            </a>

            <a
              href="#deadlines"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📅</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Dates
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-gray-950">
                {deadlineCount}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                important deadlines
              </p>

              <p className="mt-4 text-xs font-medium text-gray-400 transition group-hover:text-gray-700">
                View details →
              </p>
            </a>

            <a
              href="#risks"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚠️</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Risks
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-gray-950">
                {totalRiskCount}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                issues detected
              </p>

              <p className="mt-4 text-xs font-medium text-gray-400 transition group-hover:text-gray-700">
                View details →
              </p>
            </a>

            <a
              href="#clauses"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📄</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Clauses
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-gray-950">
                {clauseCount}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                important clauses
              </p>

              <p className="mt-4 text-xs font-medium text-gray-400 transition group-hover:text-gray-700">
                View details →
              </p>
            </a>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-xl text-white">
                💡
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Start here
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Plain-English Summary
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-6 sm:p-7">
              <p className="text-base leading-8 text-gray-700">
                {result.analysis.summary}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Risk overview
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Risk Breakdown
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  A quick view of potentially important issues found in
                  your agreement.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-5 py-3">
                <p className="text-2xl font-bold text-gray-950">
                  {totalRiskCount}
                </p>

                <p className="text-xs text-gray-500">
                  {totalRiskCount === 1
                    ? "issue detected"
                    : "issues detected"}
                </p>
              </div>
            </div>

            {totalRiskCount === 0 ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-800">
                  No risk-related issues detected
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  SamjhoSign did not identify any specific risk-related
                  clauses in the agreement.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-semibold text-red-800">High</p>

                  <p className="mt-3 text-3xl font-bold text-red-700">
                    {highRiskCount}
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {highRiskCount === 1
                      ? "high-risk issue"
                      : "high-risk issues"}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-800">
                    Medium
                  </p>

                  <p className="mt-3 text-3xl font-bold text-amber-700">
                    {mediumRiskCount}
                  </p>

                  <p className="mt-1 text-sm text-amber-600">
                    {mediumRiskCount === 1
                      ? "medium-risk issue"
                      : "medium-risk issues"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-800">
                    Low
                  </p>

                  <p className="mt-3 text-3xl font-bold text-emerald-700">
                    {lowRiskCount}
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    {lowRiskCount === 1
                      ? "low-risk issue"
                      : "low-risk issues"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            id="financial"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                💰
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Money
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Financial Obligations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Money-related commitments found in the agreement.
                </p>
              </div>
            </div>

            {financialCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No obvious financial obligations were detected.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {result.analysis.financial_obligations.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
                    >
                      <p className="text-lg font-semibold text-gray-950">
                        {item.title}
                      </p>

                      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Amount
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-950">
                          {item.amount}
                        </p>
                      </div>

                      <p className="mt-4 leading-7 text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div
            id="deadlines"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📅
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Dates & notice
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Important Deadlines
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Dates and notice periods you should pay attention to.
                </p>
              </div>
            </div>

            {deadlineCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No obvious deadlines were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.deadlines.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-lg font-semibold text-gray-950">
                        {item.title}
                      </h3>

                      <span className="w-fit rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                        {item.deadline}
                      </span>
                    </div>

                    <p className="mt-3 leading-7 text-gray-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            id="risks"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                ⚠️
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Review carefully
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Clauses to Pay Attention To
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Contract terms that may deserve closer attention.
                </p>
              </div>
            </div>

            {totalRiskCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No major risk-related clauses were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {result.analysis.risks.map((item, index) => {
                  const severity = item.severity.toLowerCase();

                  const severityClass =
                    severity === "high"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : severity === "medium"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-500">
                            {index + 1}
                          </span>

                          <h3 className="text-lg font-semibold text-gray-950">
                            {item.title}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-semibold ${severityClass}`}
                        >
                          {item.severity}
                        </span>
                      </div>

                      <p className="mt-4 leading-7 text-gray-600">
                        {item.explanation}
                      </p>

                      {item.agreement_text && (
                        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Agreement wording
                          </p>

                          <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-7 text-gray-600">
                            &quot;{item.agreement_text}&quot;
                          </blockquote>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            id="clauses"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📄
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Key terms
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Important Clauses
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Key parts of the agreement explained simply.
                </p>
              </div>
            </div>

            {clauseCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No specific clauses were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {result.analysis.important_clauses.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-500">
                          {index + 1}
                        </span>

                        <h3 className="pt-1 text-lg font-semibold text-gray-950">
                          {item.title}
                        </h3>
                      </div>

                      <p className="mt-4 leading-7 text-gray-600">
                        {item.explanation}
                      </p>

                      {item.agreement_text && (
                        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Agreement wording
                          </p>

                          <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-7 text-gray-600">
                            &quot;{item.agreement_text}&quot;
                          </blockquote>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div
            id="agreement-text"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📝
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Original text
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  Extracted Agreement
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The text extracted from your uploaded PDF.
                </p>
              </div>
            </div>

            <div className="mt-6 max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
              {result.text}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                ℹ️
              </div>

              <div>
                <h2 className="font-semibold text-gray-950">
                  Important Disclaimer
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  SamjhoSign provides an AI-powered explanation of your
                  rental agreement for informational purposes only. It is
                  not legal advice and does not determine whether a clause
                  is legally enforceable.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  For important legal decisions or disputes, consider
                  consulting a qualified legal professional.
                </p>
              </div>
            </div>
          </div>

          <div className="no-print rounded-3xl bg-black p-8 text-center text-white sm:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-gray-400">
              Finished reviewing?
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Have another agreement?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-400">
              Upload another rental agreement and get a fresh analysis.
            </p>

            <button
              type="button"
              onClick={handleStartOver}
              className="mt-7 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Analyze Another Agreement
            </button>
          </div>
        </div>
      )}
    </section>
  );
}