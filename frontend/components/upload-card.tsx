"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import AskSamjhoSign from "@/components/ask-samjhosign";

function cleanAgreementText(text: string) {
  return text
    .replace(/₹/g, "Rs.")
    .replace(/■/g, "Rs.")
    .trim();
}

function isTenancyAgreement(analysis: Analysis) {
  const category = (analysis.agreement_category || "").toLowerCase();
  const type = (analysis.agreement_type || "").toLowerCase();
  return (category === "housing" || category === "lease" || type.includes("rental") || type.includes("lease") || type.includes("tenancy"));
}

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

/* ============================================================
   NEW: AI NEGOTIATION SUGGESTIONS
   ============================================================ */

type NegotiationSuggestion = {
  title: string;
  priority: string;
  current_term: string;
  suggestion: string;
  reason: string;
};

type Analysis = {
  overall_risk: string;
  summary: string;

  // Universal agreement classification.
  agreement_type?: string;
  agreement_category?: string;
  financial_obligations: FinancialObligation[];
  deadlines: Deadline[];
  risks: Risk[];
  important_clauses: ImportantClause[];
  legal_findings: LegalFinding[];

  /* NEW */
  negotiation_suggestions: NegotiationSuggestion[];
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
  const [activeSection, setActiveSection] = useState("summary");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    if (!result) {
      return;
    }

    const sectionIds = [
      "summary",
      "financial",
      "deadlines",
      "risks",
      "negotiation",
      ...(isTenancyAgreement(result.analysis) ? ["legal-check"] : []),
      "clauses",
      "agreement-text",
    ];

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(
        (section): section is HTMLElement => section !== null
      );

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleEntries.length > 0) {
          setActiveSection(
            visibleEntries[0].target.id
          );
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () => observer.disconnect();
  }, [result]);

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

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    if (!isAnalyzing) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDragging(false);

    if (isAnalyzing) {
      return;
    }

    const droppedFile =
      event.dataTransfer.files?.[0];

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
    setActiveSection("summary");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAnalysisToSupabase(
    data: Result
  ) {
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

      const { error: saveError } =
        await supabase
          .from("analyses")
          .insert({
            user_id: user.id,
            filename: data.filename,
            pages: data.pages,
            text: data.text,
            analysis: data.analysis,
          });

      if (saveError) {
        console.error(
          "Supabase save error:",
          saveError
        );

        setSaveMessage(
          "Analysis completed, but the report could not be saved."
        );

        return;
      }

      setSaveMessage(
        "✓ Analysis saved to your account."
      );
    } catch (err) {
      console.error(
        "Save analysis error:",
        err
      );

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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setShowSignInPrompt(true);
        return;
      }

      const formData = new FormData();

      formData.append("file", file);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";

      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        setShowSignInPrompt(true);
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      /* Make sure older backend responses do not crash
         the frontend before the new field is available. */
      data.analysis.negotiation_suggestions =
        Array.isArray(
          data.analysis.negotiation_suggestions
        )
          ? data.analysis.negotiation_suggestions
          : [];

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
      console.error(
        "Analysis error:",
        err
      );

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
    const normalizedRisk =
      risk.toLowerCase();

    if (normalizedRisk === "high") {
      return {
        container:
          "border-red-200 bg-white",
        icon:
          "bg-red-100 text-red-700",
        text:
          "text-red-700",
        label:
          "High Risk",
      };
    }

    if (normalizedRisk === "medium") {
      return {
        container:
          "border-amber-200 bg-white",
        icon:
          "bg-amber-100 text-amber-700",
        text:
          "text-amber-700",
        label:
          "Medium Risk",
      };
    }

    return {
      container:
        "border-emerald-200 bg-white",
      icon:
        "bg-emerald-100 text-emerald-700",
      text:
        "text-emerald-700",
      label:
        "Low Risk",
    };
  }

  function getLegalStatusStyles(
    status: string
  ) {
    const normalizedStatus =
      status.toLowerCase();

    if (
      normalizedStatus ===
      "potentially inconsistent"
    ) {
      return {
        container:
          "border-red-200 bg-white",
        badge:
          "border-red-200 bg-red-100 text-red-700",
        icon: "!",
      };
    }

    if (
      normalizedStatus === "attention"
    ) {
      return {
        container:
          "border-amber-200 bg-white",
        badge:
          "border-amber-200 bg-amber-100 text-amber-700",
        icon: "!",
      };
    }

    if (
      normalizedStatus ===
      "generally consistent"
    ) {
      return {
        container:
          "border-emerald-200 bg-white",
        badge:
          "border-emerald-200 bg-emerald-100 text-emerald-700",
        icon: "✓",
      };
    }

    return {
      container:
        "border-gray-200 bg-gray-50",
      badge:
        "border-gray-200 bg-gray-100 text-gray-600",
      icon: "?",
    };
  }

  const loadingMessages = [
    {
      title:
        "Reading your agreement",
      description:
        "Extracting the text from your agreement.",
    },
    {
      title:
        "Finding important clauses",
      description:
        "Looking for terms that may affect you as a tenant.",
    },
    {
      title:
        "Checking financial obligations",
      description:
        "Reviewing rent, deposits, fees and other payments.",
    },
    {
      title:
        "Preparing your summary",
      description:
        "Turning the agreement into simple, understandable language.",
    },
  ];

  const highRiskCount =
    result?.analysis.risks.filter(
      (item) =>
        item.severity.toLowerCase() ===
        "high"
    ).length ?? 0;

  const mediumRiskCount =
    result?.analysis.risks.filter(
      (item) =>
        item.severity.toLowerCase() ===
        "medium"
    ).length ?? 0;

  const lowRiskCount =
    result?.analysis.risks.filter(
      (item) =>
        item.severity.toLowerCase() ===
        "low"
    ).length ?? 0;

  const totalRiskCount =
    result?.analysis.risks.length ?? 0;

  const financialCount =
    result?.analysis
      .financial_obligations.length ?? 0;

  const deadlineCount =
    result?.analysis.deadlines.length ?? 0;

  const clauseCount =
    result?.analysis
      .important_clauses.length ?? 0;

  const legalFindingCount =
    result?.analysis.legal_findings.length ?? 0;

  const showTamilNaduLegalCheck =
    result !== null && isTenancyAgreement(result.analysis);

  /* NEW */
  const negotiationCount =
    result?.analysis
      .negotiation_suggestions?.length ?? 0;

  return (
    <>
      {showSignInPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-prompt-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-7 shadow-2xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-xl text-white">
              🔐
            </div>

            <h2
              id="signin-prompt-title"
              className="mt-5 text-2xl font-bold tracking-tight text-gray-950"
            >
              Sign in required
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Please sign in to analyze your agreement and save your report
              securely to your SamjhoSign account.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/auth/login";
                }}
                className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Sign in
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file &&
        !isAnalyzing &&
        !result && (
          <div className="samjho-fade-up mx-auto max-w-4xl">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleChooseFile}
              className={`samjho-upload-zone group relative cursor-pointer overflow-hidden rounded-[2rem] border bg-white p-3 shadow-xl shadow-black/[0.04] transition-all duration-300 sm:p-4 ${
                isDragging
                  ? "scale-[1.01] border-gray-950 bg-gray-50 shadow-2xl"
                  : "border-gray-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-2xl hover:shadow-black/[0.07]"
              }`}
            >
              <div
                className={`relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed px-6 py-12 text-center transition-colors duration-300 sm:min-h-[390px] ${
                  isDragging
                    ? "border-gray-950 bg-gray-100"
                    : "border-gray-200 bg-gray-50/70 group-hover:border-gray-400 group-hover:bg-gray-50"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-40">
                  <div className="samjho-grid absolute inset-0" />
                </div>

                <div className="relative">
                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-xl shadow-black/10 transition-transform duration-300 ${
                      isDragging
                        ? "scale-110 -translate-y-1"
                        : "group-hover:-translate-y-1"
                    }`}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M5 20h14" />
                    </svg>
                  </div>

                  <div className="mt-7">
                    <p className="text-2xl font-bold tracking-[-0.03em] text-gray-950 sm:text-3xl">
                      {isDragging
                        ? "Drop your agreement here"
                        : "Upload your agreement"}
                    </p>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                      Drag and drop your agreement PDF here,
                      or click to browse your
                      computer.
                    </p>
                  </div>

                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                      PDF only
                    </span>

                    <span className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                      Up to 10 MB
                    </span>

                    <span className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                      Secure processing
                    </span>
                  </div>
                </div>

                <div className="relative mt-8 flex items-center gap-2 text-xs text-gray-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>

                  Your document is used to
                  generate this analysis.
                </div>
              </div>
            </div>
          </div>
        )}

      {file &&
        !result &&
        !isAnalyzing && (
          <div className="samjho-fade-up mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.05]">
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                      Ready to analyze
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Your agreement has been
                      uploaded successfully.
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    ✓
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-xs font-bold tracking-wide text-white shadow-lg">
                    PDF
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold text-gray-950">
                      {file.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      PDF ·{" "}
                      {(file.size / 1024).toFixed(
                        1
                      )}{" "}
                      KB
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                    Ready
                  </span>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={handleAnalyze}
                    className="group flex h-13 items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl"
                  
                     whileHover={{ y: -2, scale: 1.01 }}
                     whileTap={{ scale: 0.98 }}
                   >
                    Analyze agreement

                    <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleChooseFile}
                    className="h-13 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                  
                     whileHover={{ y: -2 }}
                     whileTap={{ scale: 0.98 }}
                   >
                    Choose a different file
                  </motion.button>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Analysis may take a few
                  moments depending on the
                  agreement length.
                </p>
              </div>
            </div>
          </div>
        )}

      {isAnalyzing && (
        <div className="samjho-scale-in mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.05]">
            <div className="bg-gray-950 px-6 py-8 text-white sm:px-9 sm:py-9">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-white/5" />

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2h9l3 3v17H6z" />
                    <path d="M14 2v4h4" />
                    <path d="M9 13h6" />
                    <path d="M9 17h4" />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    SamjhoSign is working
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight">
                    Analyzing your agreement
                  </h2>
                </div>
              </div>

              <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm leading-6 text-gray-500">
                We're reviewing the agreement
                for financial obligations,
                deadlines, responsibilities,
                restrictions, risks, negotiation
                opportunities, and other
                important terms.
              </p>

              <div className="mt-7 space-y-3">
                {loadingMessages.map(
                  (message, index) => {
                    const isComplete =
                      loadingStep > index;
                    const isCurrent =
                      loadingStep === index;

                    return (
                      <div
                        key={index}
                        className={`samjho-fade-up flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                          isCurrent
                            ? "border-gray-300 bg-gray-50 shadow-sm"
                            : isComplete
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                            isComplete
                              ? "bg-emerald-100 text-emerald-700"
                              : isCurrent
                              ? "bg-gray-950 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isComplete ? (
                            "✓"
                          ) : isCurrent ? (
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className="min-w-0 text-left">
                          <p
                            className={`font-semibold ${
                              isCurrent
                                ? "text-gray-950"
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
                  }
                )}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>

                <p className="text-xs leading-5 text-gray-500">
                  Your agreement is being
                  processed securely for this
                  analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="samjho-fade-up mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
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
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Dismiss
            </button>
          )}
        </div>
      )}      {result && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          id="analysis-results"
          className="samjho-fade-up mt-12 scroll-mt-24 space-y-7"
        >
          {/* ACTION BUTTONS */}
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

          {/* ASK SAMJHOSIGN */}
          <AskSamjhoSign agreementText={result.text} />

          {/* SAVE MESSAGE */}
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

          {/* PRINT HEADER */}
          <div className="hidden print:block">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              SamjhoSign
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {result.analysis.agreement_type
                ? `${result.analysis.agreement_type} Analysis`
                : "Agreement Analysis"}
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {result.filename}
            </p>
          </div>

          {/* SUCCESS HEADER */}
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-6 text-gray-950 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600 ring-1 ring-emerald-100">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-950">
                    Agreement analyzed successfully
                  </p>

                  <p className="mt-1 truncate text-sm text-gray-600">
                    {result.filename}
                  </p>

                  {result.pages !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      {result.pages} pages analyzed
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartOver}
                className="no-print rounded-xl border border-gray-200 bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Analyze another
              </button>
            </div>
          </div>

          {/* AGREEMENT CLASSIFICATION */}
          {(result.analysis.agreement_type ||
            result.analysis.agreement_category) && (
            <div className="samjho-fade-up grid gap-4 sm:grid-cols-2">
              {result.analysis.agreement_type && (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Agreement type
                  </p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    {result.analysis.agreement_type}
                  </p>
                </div>
              )}

              {result.analysis.agreement_category && (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Category
                  </p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    {result.analysis.agreement_category}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STICKY NAVIGATION */}
          <div className="no-print samjho-fade-in sticky top-16 z-40 -mx-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-md backdrop-blur">
            <div className="flex min-w-max items-center gap-1">
              {[
                { id: "summary", label: "Summary" },
                { id: "financial", label: "Money" },
                { id: "deadlines", label: "Deadlines" },
                { id: "risks", label: "Risks" },

                /* NEW */
                { id: "negotiation", label: "Negotiate" },

                ...(showTamilNaduLegalCheck
                  ? [{ id: "legal-check", label: "TN Legal Check" }]
                  : []),
                { id: "clauses", label: "Clauses" },
                { id: "agreement-text", label: "Agreement" },
              ].map((item) => {
                const isActive =
                  activeSection === item.id;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() =>
                      setActiveSection(item.id)
                    }
                    className={`rounded-xl px-4 py-2 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-gray-950 font-semibold text-white shadow-sm"
                        : "font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                    }`}
                  >
                    {item.id === "legal-check" && ""}

                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              SUMMARY
              ===================================================== */}

          <div
            id="summary"
            className="scroll-mt-36"
          >
            {(() => {
              const riskStyles =
                getRiskStyles(
                  result.analysis.overall_risk
                );

              return (
                <div className="samjho-fade-up overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
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

                    <div
                      className={`flex shrink-0 items-center gap-4 rounded-2xl border p-4 ${riskStyles.container}`}
                    >
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${riskStyles.icon}`}
                      >
                        {result.analysis.overall_risk
                          .toLowerCase() === "low"
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

                  <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                      Plain-English summary
                    </p>

                    <p className="mt-3 text-base leading-8 text-gray-700">
                      {result.analysis.summary}
                    </p>
                  </div>

                  {/* SUMMARY STATS */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <a
                      href="#financial"
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-2xl font-bold text-gray-950">
                        {financialCount}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Money items
                      </p>
                    </a>

                    <a
                      href="#deadlines"
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-2xl font-bold text-gray-950">
                        {deadlineCount}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Deadlines
                      </p>
                    </a>

                    <a
                      href="#risks"
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-2xl font-bold text-gray-950">
                        {totalRiskCount}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Risks
                      </p>
                    </a>

                    {/* NEW NEGOTIATION STAT */}
                    <a
                      href="#negotiation"
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                    >
                      <p className="text-2xl font-bold text-gray-950">
                        {negotiationCount}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        AI suggestions
                      </p>
                    </a>

                    {showTamilNaduLegalCheck && (
                    <a
                      href="#legal-check"
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-2xl font-bold text-gray-950">
                        {legalFindingCount}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Legal checks
                      </p>
                    </a>
                    )}
                  </div>

                  {/* RISK BREAKDOWN */}
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-950">
                          Risk breakdown
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Findings identified in your agreement.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                          {highRiskCount} high
                        </span>

                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          {mediumRiskCount} medium
                        </span>

                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                          {lowRiskCount} low
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* =====================================================
              FINANCIAL OBLIGATIONS
              ===================================================== */}

          <div
            id="financial"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-sm">
                ₹
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Money
                </p>

                <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
                  Financial Obligations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Payments and financial responsibilities found in the agreement.
                </p>
              </div>
            </div>

            {financialCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No specific financial obligations were detected.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {result.analysis.financial_obligations.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="samjho-fade-up rounded-2xl border border-gray-200 bg-[#fafafa] p-5"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-gray-950">
                          {item.title}
                        </h3>

                        <span className="shrink-0 rounded-full bg-gray-950 px-3 py-1 text-xs font-semibold text-white">
                          {item.amount}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              DEADLINES
              ===================================================== */}

          <div
            id="deadlines"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-sm">
                ⏱
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Important dates
                </p>

                <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
                  Deadlines
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Dates and notice periods you may need to remember.
                </p>
              </div>
            </div>

            {deadlineCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
                No specific deadlines were detected.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.deadlines.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="samjho-fade-up rounded-2xl border border-gray-200 bg-[#fafafa] p-5 sm:p-6"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-950">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {item.deadline}
                          </p>
                        </div>

                        <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                          Deadline
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              RISKS
              ===================================================== */}

          <div
            id="risks"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-sm">
                !
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Things to review
                </p>

                <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
                  Risks
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Clauses that may deserve closer attention.
                </p>
              </div>
            </div>

            {totalRiskCount === 0 ? (
              <p className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-700">
                No specific risks were detected in the agreement.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {result.analysis.risks.map(
                  (item, index) => {
                    const severity =
                      item.severity.toLowerCase();

                    const severityClass =
                      severity === "high"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : severity === "medium"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-gray-50 text-gray-600";

                    return (
                      <div
                        key={index}
                        className="samjho-fade-up rounded-2xl border border-gray-200 bg-[#fafafa] p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-950">
                              {item.title}
                            </h3>
                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${severityClass}`}
                          >
                            {item.severity}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-gray-600">
                          {item.explanation}
                        </p>

                        {item.agreement_text && (
                          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                              Agreement wording
                            </p>

                            <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-7 text-gray-600">
                              &quot;
                              {cleanAgreementText(
                                item.agreement_text
                              )}
                              &quot;
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

          {/* =====================================================
              AI NEGOTIATION SUGGESTIONS
              ===================================================== */}

          <div
            id="negotiation"
            className="samjho-fade-up scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Take action
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-[1.65rem] font-bold tracking-tight text-gray-950">
                    What You Should Consider Negotiating
                  </h2>

                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                    AI-generated
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  SamjhoSign identified agreement terms that may be worth
                  discussing with the other party before you sign.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3">
                <p className="text-2xl font-bold text-gray-950">
                  {negotiationCount}
                </p>

                <p className="text-xs text-gray-500">
                  {negotiationCount === 1
                    ? "suggestion"
                    : "suggestions"}
                </p>
              </div>
            </div>

            {negotiationCount === 0 ? (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="font-semibold text-gray-800">
                  No specific negotiation points were identified.
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  SamjhoSign did not find a clear agreement term that it
                  could responsibly turn into a negotiation suggestion.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {result.analysis.negotiation_suggestions.map(
                  (item, index) => {
                    const priority =
                      item.priority.toLowerCase();

                    const priorityClass =
                      priority === "high"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : priority === "medium"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-gray-50 text-gray-600";

                    return (
                      <div
                        key={index}
                        className="samjho-fade-up rounded-2xl border border-gray-200 bg-[#fafafa] p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">
                              {index + 1}
                            </span>

                            <div>
                              <h3 className="pt-1 text-lg font-semibold text-gray-950">
                                {item.title}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass}`}
                          >
                            {item.priority} priority
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-gray-200 bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              Current term
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-700">
                              {cleanAgreementText(
                                item.current_term
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-gray-200 bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              Suggested change
                            </p>

                            <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
                              {cleanAgreementText(
                                item.suggestion
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl bg-gray-950 p-5 text-white">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Why consider it?
                          </p>

                          <p className="mt-2 text-sm leading-6 text-gray-300">
                            {cleanAgreementText(
                              item.reason
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              TAMIL NADU LEGAL CHECK
              ===================================================== */}

          {showTamilNaduLegalCheck && (
            <div
              id="legal-check"
              className="samjho-fade-up scroll-mt-36 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
            <div className="border-b border-gray-200 bg-gray-50 p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  🇮🇳
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Official-source comparison
                  </p>

                  <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
                    Tamil Nadu Legal Check
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Relevant tenancy references from official sources.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-8">
              {legalFindingCount === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="font-semibold text-gray-800">
                    No specific legal findings were generated.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    This does not mean the agreement is legally compliant.
                    It means no specific comparison was identified from the
                    available references.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {result.analysis.legal_findings.map(
                    (item, index) => {
                      const statusStyles =
                        getLegalStatusStyles(
                          item.status
                        );

                      return (
                        <div
                          key={index}
                          className={`samjho-fade-up rounded-2xl border p-5 sm:p-6 ${statusStyles.container}`}
                          style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${statusStyles.badge}`}
                              >
                                {statusStyles.icon}
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-gray-950">
                                  {item.title}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                  {item.explanation}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles.badge}`}
                              >
                                {item.status}
                              </span>

                              <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                                {item.severity} severity
                              </span>
                            </div>
                          </div>

                          {item.agreement_text && (
                            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                                Agreement wording
                              </p>

                              <blockquote className="border-l-2 border-gray-300 pl-4 text-sm italic leading-7 text-gray-600">
                                &quot;
                                {cleanAgreementText(
                                  item.agreement_text
                                )}
                                &quot;
                              </blockquote>
                            </div>
                          )}

                          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              Legal reference
                            </p>

                            <p className="mt-2 font-semibold text-gray-900">
                              {item.legal_reference ||
                                "Not specified"}
                            </p>

                            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                              Source
                            </p>

                            <p className="mt-2 font-semibold text-gray-900">
                              {item.source ||
                                "Official source"}
                            </p>

                            {item.source_url && (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 transition hover:text-black"
                              >
                                View official source →
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-900">
                  Important
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  This legal check is an informational comparison against
                  the supplied Tamil Nadu tenancy references. It is not a
                  legal opinion and does not determine whether a clause is
                  legally enforceable. For important legal decisions,
                  consult a qualified legal professional.
                </p>
              </div>
            </div>
          </div>
          )}

          {/* =====================================================
              IMPORTANT CLAUSES
              ===================================================== */}

          <div
            id="clauses"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-sm">
                📄
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Key terms
                </p>

                <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
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
                      className="samjho-fade-up rounded-2xl border border-gray-200 bg-[#fafafa] p-5 sm:p-6"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-500">
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
                            &quot;
                            {cleanAgreementText(
                              item.agreement_text
                            )}
                            &quot;
                          </blockquote>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              EXTRACTED AGREEMENT
              ===================================================== */}

          <div
            id="agreement-text"
            className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-sm">
                📝
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Original text
                </p>

                <h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">
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

          {/* =====================================================
              DISCLAIMER
              ===================================================== */}

          <div className="samjho-fade-up rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-7">
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
                  agreement for informational purposes only. It is
                  not legal advice and does not determine whether a clause
                  is legally enforceable.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  AI-generated negotiation suggestions are practical
                  discussion points, not legal instructions. For important
                  legal decisions or disputes, consider consulting a
                  qualified legal professional.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              FINAL CTA
              ===================================================== */}

          <div className="no-print samjho-scale-in rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-950 shadow-sm sm:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-gray-400">
              Finished reviewing?
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Have another agreement?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              Upload another agreement and get a fresh analysis.
            </p>

            <button
              type="button"
              onClick={handleStartOver}
              className="mt-7 rounded-xl bg-gray-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Analyze Another Agreement
            </button>
          </div>
        </motion.div>
      )}
    </section>
    </>
  );
}