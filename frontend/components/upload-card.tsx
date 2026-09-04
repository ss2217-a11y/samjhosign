"use client";

import { useRef, useState } from "react";

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
  pages: number;
  text: string;
  analysis: Analysis;
};

export default function UploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleChooseFile() {
    if (isAnalyzing) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setResult(null);

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  }

  function handleStartOver() {
    setFile(null);
    setResult(null);
    setError("");
    setLoadingStep(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep(0);
    setError("");
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

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLoadingStep(4);
      setResult(data);

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

  const totalRiskCount =
    result?.analysis.risks.length ?? 0;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-24">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload button */}
      {!file && !isAnalyzing && !result && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleChooseFile}
            className="rounded-2xl bg-black px-8 py-4 text-lg font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
          >
            Upload Agreement
          </button>
        </div>
      )}

      {/* Selected file */}
      {file && !result && !isAnalyzing && (
        <div className="space-y-5">
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

              <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:block">
                Ready
              </div>
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
            Analysis may take a few moments depending on the agreement length.
          </p>
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                <span className="text-2xl">
                  📄
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-gray-900">
                Analyzing your agreement
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                SamjhoSign is carefully reviewing your rental
                agreement. This may take a few moments.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {loadingMessages.map((message, index) => {
                const isComplete =
                  loadingStep > index;

                const isCurrent =
                  loadingStep === index;

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
                🔒 Your agreement is being processed securely for this analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
          <p className="font-medium">
            Something went wrong
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>

          {!isAnalyzing && (
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          id="analysis-results"
          className="mt-12 scroll-mt-24 space-y-6"
        >
          {/* Result actions */}
          <div className="no-print flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handlePrintReport}
              className="rounded-2xl bg-black px-7 py-3.5 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
            >
              🖨️ Save as PDF
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              className="rounded-2xl border border-gray-300 bg-white px-7 py-3.5 text-base font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Analyze another
            </button>
          </div>

          {/* Report title */}
          <div className="hidden print:block">
            <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
              SamjhoSign
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Rental Agreement Analysis
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {result.filename}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {result.pages} page
              {result.pages !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Success header */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-emerald-900">
                    Agreement analyzed successfully
                  </p>

                  <p className="mt-1 truncate text-sm text-emerald-700">
                    {result.filename}
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    {result.pages} page
                    {result.pages !== 1 ? "s" : ""} extracted
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartOver}
                className="no-print w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 sm:w-auto"
              >
                Analyze another
              </button>
            </div>
          </div>

          {/* Results navigation */}
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

          {/* Overall Risk */}
          <div
            id="summary"
            className="scroll-mt-36"
          >
            {(() => {
              const riskStyles = getRiskStyles(
                result.analysis.overall_risk
              );

              return (
                <div
                  className={`rounded-3xl border p-7 shadow-sm ${riskStyles.container}`}
                >
                  <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                        Overall agreement risk
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        Risk assessment
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                        This assessment is based on potentially important
                        terms detected in the uploaded agreement.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${riskStyles.icon}`}
                      >
                        {result.analysis.overall_risk
                          .toLowerCase() === "low"
                          ? "✓"
                          : "!"}
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Assessment
                        </p>

                        <p
                          className={`text-2xl font-bold ${riskStyles.text}`}
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

          {/* Risk Breakdown */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    📊
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Risk Breakdown
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  A quick view of the potentially important issues found
                  in your agreement.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {totalRiskCount}
                </p>

                <p className="text-sm text-gray-500">
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
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-red-800">
                      High
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                      !
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-red-700">
                    {highRiskCount}
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {highRiskCount === 1
                      ? "high-risk issue"
                      : "high-risk issues"}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-amber-800">
                      Medium
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                      !
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-amber-700">
                    {mediumRiskCount}
                  </p>

                  <p className="mt-1 text-sm text-amber-600">
                    {mediumRiskCount === 1
                      ? "medium-risk issue"
                      : "medium-risk issues"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-emerald-800">
                      Low
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      ✓
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-emerald-700">
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

          {/* Summary */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                💡
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Start here
                </p>

                <h2 className="text-2xl font-bold text-gray-900">
                  Plain-English Summary
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-6">
              <p className="leading-8 text-gray-700">
                {result.analysis.summary}
              </p>
            </div>
          </div>

          {/* Financial Obligations */}
          <div
            id="financial"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                💰
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Financial Obligations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Money-related commitments found in the agreement.
                </p>
              </div>
            </div>

            {result.analysis.financial_obligations.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No obvious financial obligations were detected.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {result.analysis.financial_obligations.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300"
                    >
                      <p className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </p>

                      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Amount
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
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

          {/* Deadlines */}
          <div
            id="deadlines"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                📅
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Important Deadlines
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Dates and notice periods you should pay attention to.
                </p>
              </div>
            </div>

            {result.analysis.deadlines.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No obvious deadlines were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.deadlines.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <span className="w-fit rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700">
                          {item.deadline}
                        </span>
                      </div>

                      <p className="mt-3 leading-7 text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Risks */}
          <div
            id="risks"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                ⚠️
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Clauses to Pay Attention To
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Contract terms that may deserve closer attention.
                </p>
              </div>
            </div>

            {result.analysis.risks.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No major risk-related clauses were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.risks.map(
                  (item, index) => {
                    const severity =
                      item.severity.toLowerCase();

                    const severityClass =
                      severity === "high"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : severity === "medium"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700";

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-500">
                              {index + 1}
                            </span>

                            <h3 className="text-lg font-semibold text-gray-900">
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
                          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Agreement wording
                            </p>

                            <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-6 text-gray-600">
                              "{item.agreement_text}"
                            </blockquote>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Important Clauses */}
          <div
            id="clauses"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                📄
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Important Clauses
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Key parts of the agreement explained simply.
                </p>
              </div>
            </div>

            {result.analysis.important_clauses.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No specific clauses were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.important_clauses.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-500">
                          {index + 1}
                        </span>

                        <h3 className="pt-1 text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>
                      </div>

                      <p className="mt-4 leading-7 text-gray-600">
                        {item.explanation}
                      </p>

                      {item.agreement_text && (
                        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Agreement wording
                          </p>

                          <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-6 text-gray-600">
                            "{item.agreement_text}"
                          </blockquote>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Extracted Agreement */}
          <div
            id="agreement-text"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                📝
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Extracted Agreement
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The text extracted from your uploaded PDF.
                </p>
              </div>
            </div>

            <div className="mt-6 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
              {result.text}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                ℹ️
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Important Disclaimer
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  SamjhoSign provides an AI-powered explanation
                  of your rental agreement for informational
                  purposes only. It is not legal advice and does
                  not determine whether a clause is legally
                  enforceable.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  For important legal decisions or disputes,
                  consider consulting a qualified legal
                  professional.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="no-print rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Finished reviewing this agreement?
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Analyze another agreement
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              Upload another rental agreement and get a fresh analysis.
            </p>

            <button
              type="button"
              onClick={handleStartOver}
              className="mt-6 rounded-2xl bg-black px-8 py-4 text-lg font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
            >
              Analyze Another Agreement
            </button>
          </div>
        </div>
      )}
    </section>
  );
}