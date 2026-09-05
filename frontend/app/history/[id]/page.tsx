 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { motion } from "motion/react";
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
  financial_obligations: FinancialObligation[];
  deadlines: Deadline[];
  risks: Risk[];
  important_clauses: ImportantClause[];
  legal_findings: LegalFinding[];
  negotiation_suggestions?: NegotiationSuggestion[];
};

type SavedAnalysis = {
  id: string;
  created_at: string;
  filename: string;
  pages: number | null;
  text: string;
  analysis: Analysis;
};

function cleanText(text: string) {
  return (text || "").replace(/₹/g, "Rs.").replace(/■/g, "Rs.").trim();
}

function riskStyle(risk: string) {
  const value = risk.toLowerCase();

  if (value === "high") {
    return {
      container: "border-red-200 bg-red-50",
      badge: "border-red-200 bg-red-100 text-red-700",
      text: "text-red-700",
      label: "High Risk",
    };
  }

  if (value === "medium") {
    return {
      container: "border-amber-200 bg-amber-50",
      badge: "border-amber-200 bg-amber-100 text-amber-700",
      text: "text-amber-700",
      label: "Medium Risk",
    };
  }

  return {
    container: "border-emerald-200 bg-emerald-50",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
    label: "Low Risk",
  };
}

function legalStyle(status: string) {
  const value = status.toLowerCase();

  if (value.includes("inconsistent")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (value.includes("attention")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value.includes("consistent")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  size = 10,
  lineHeight = 5
) {
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(cleanText(text) || "Not provided", width);

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

export default function AnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");

  useEffect(() => {
    async function loadReport() {
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
          .select("id, created_at, filename, pages, text, analysis")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setAnalysis(data as SavedAnalysis);
      } catch (err) {
        console.error("Report loading error:", err);
        setError("We couldn't load this report. It may have been deleted or you may not have access to it.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadReport();
    }
  }, [id, router, supabase]);

  useEffect(() => {
    if (!analysis) return;

    const ids = [
      "summary",
      "financial",
      "deadlines",
      "risks",
      "negotiation",
      "legal-check",
      "clauses",
      "agreement-text",
    ];

    const elements = ids
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-110px 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [analysis]);

  async function downloadPDF() {
    if (!analysis) return;

    setDownloading(true);

    try {
      const doc = new jsPDF();
      const a = analysis.analysis;
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SamjhoSign", 20, y);
      y += 10;

      doc.setFontSize(16);
      doc.text("Rental Agreement Report", 20, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y = addWrappedText(doc, `Agreement: ${analysis.filename}`, 20, y, 170);
      y = addWrappedText(
        doc,
        `Pages: ${analysis.pages ?? "Unknown"} · Created: ${new Date(analysis.created_at).toLocaleString()}`,
        20,
        y + 2,
        170
      );

      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Overall Risk", 20, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      y = addWrappedText(doc, a.overall_risk || "Not provided", 20, y, 170);
      y += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Plain-English Summary", 20, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      y = addWrappedText(doc, a.summary, 20, y, 170);
      y += 8;

      const addListSection = (
        title: string,
        items: Array<{ title: string; explanation: string; amount?: string; deadline?: string; severity?: string; agreement_text?: string }>
      ) => {
        if (y > 255) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title, 20, y);
        y += 8;

        doc.setFont("helvetica", "normal");

        if (!items?.length) {
          y = addWrappedText(doc, "No specific items were detected.", 20, y, 170);
          y += 7;
          return;
        }

        items.forEach((item, index) => {
          if (y > 255) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${index + 1}. ${cleanText(item.title)}`, 20, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          y = addWrappedText(doc, item.explanation, 20, y, 170, 9, 4.5);

          if (item.amount) {
            y += 2;
            y = addWrappedText(doc, `Amount: ${item.amount}`, 20, y, 170, 9, 4.5);
          }

          if (item.deadline) {
            y += 2;
            y = addWrappedText(doc, `Deadline: ${item.deadline}`, 20, y, 170, 9, 4.5);
          }

          if (item.severity) {
            y += 2;
            y = addWrappedText(doc, `Severity: ${item.severity}`, 20, y, 170, 9, 4.5);
          }

          if (item.agreement_text) {
            y += 2;
            y = addWrappedText(
              doc,
              `Agreement wording: "${item.agreement_text}"`,
              25,
              y,
              165,
              9,
              4.5
            );
          }

          y += 7;
        });
      };

      addListSection("Financial Obligations", a.financial_obligations);
      addListSection("Important Deadlines", a.deadlines);
      addListSection("Risks", a.risks);

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Tamil Nadu Legal Check", 20, y);
      y += 8;
      doc.setFont("helvetica", "normal");

      if (!a.legal_findings?.length) {
        y = addWrappedText(doc, "No specific legal findings were returned.", 20, y, 170);
      } else {
        a.legal_findings.forEach((item, index) => {
          if (y > 245) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${index + 1}. ${cleanText(item.title)} — ${cleanText(item.status)}`, 20, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          y = addWrappedText(doc, item.explanation, 20, y, 170, 9, 4.5);

          if (item.legal_reference) {
            y = addWrappedText(doc, `Reference: ${item.legal_reference}`, 20, y + 2, 170, 9, 4.5);
          }

          if (item.agreement_text) {
            y = addWrappedText(
              doc,
              `Agreement wording: "${item.agreement_text}"`,
              25,
              y + 2,
              165,
              9,
              4.5
            );
          }

          y += 6;
        });
      }

      addListSection("Important Clauses", a.important_clauses);

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Disclaimer", 20, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      addWrappedText(
        doc,
        "SamjhoSign provides an AI-powered explanation of rental agreements for informational purposes only. The Tamil Nadu Legal Check is an informational comparison against selected legal references and is not a legal opinion. SamjhoSign does not determine whether a clause is legally enforceable. For important legal decisions or disputes, consult a qualified legal professional.",
        20,
        y,
        170,
        9,
        4.5
      );

      const totalPages = doc.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`SamjhoSign · Page ${page} of ${totalPages}`, 20, 290);
        doc.setTextColor(0, 0, 0);
      }

      const safeFilename = analysis.filename
        .replace(/\.pdf$/i, "")
        .replace(/[^a-z0-9-_]+/gi, "_")
        .replace(/^_+|_+$/g, "");

      doc.save(`${safeFilename || "agreement"}_SamjhoSign_Report.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("The PDF could not be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-5 h-12 w-96 max-w-full rounded-xl bg-gray-200" />
            <div className="mt-4 h-5 w-72 rounded bg-gray-200" />
            <div className="mt-10 h-52 rounded-3xl bg-white" />
          </div>
        </div>
      </motion.main>
    );
  }

  if (error || !analysis) {
    return (
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-950">
              Report unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error || "This analysis could not be found."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/history")}
              className="mt-7 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Back to My Analyses
            </button>
          </div>
        </div>
      </motion.main>
    );
  }

  const a = analysis.analysis;
  const risk = riskStyle(a.overall_risk);

  const tabs = [
    ["summary", "Summary"],
    ["financial", "Money"],
    ["deadlines", "Deadlines"],
    ["risks", "Risks"],
    ["negotiation", "Negotiate"],
    ["legal-check", "TN Legal Check"],
    ["clauses", "Clauses"],
    ["agreement-text", "Agreement"],
  ];

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="min-h-screen bg-[#f7f7f5] text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="text-sm font-semibold text-gray-500 hover:text-gray-950"
          >
            ← My Analyses
          </button>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                Saved analysis
              </p>

              <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                {analysis.filename}
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                {analysis.pages ?? "Unknown"} pages ·{" "}
                {new Date(analysis.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${risk.badge}`}>
                {risk.label}
              </span>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={downloading}
                className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {downloading ? "Preparing PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <nav className="sticky top-16 z-40 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map(([sectionId, label]) => {
              const active = activeSection === sectionId;

              return (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => {
                    setActiveSection(sectionId);
                    document.getElementById(sectionId)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-gray-950 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:px-6">
        <div
          id="summary"
          className={`scroll-mt-36 rounded-3xl border p-7 shadow-sm sm:p-9 ${risk.container}`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
            Overall assessment
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className={`text-4xl font-bold ${risk.text}`}>
                {risk.label}
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-700">
                {a.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Findings
              </p>
              <p className="mt-1 text-3xl font-bold">
                {(a.risks?.length ?? 0) + (a.legal_findings?.length ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <ReportSection id="financial" eyebrow="Money" title="Financial Obligations" description="Money-related commitments found in the agreement.">
          {!a.financial_obligations?.length ? (
            <EmptyState text="No obvious financial obligations were detected." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {a.financial_obligations.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="font-semibold text-gray-950">{item.title}</h3>
                  <p className="mt-3 text-2xl font-bold text-gray-950">{cleanText(item.amount)}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection id="deadlines" eyebrow="Dates & notice" title="Important Deadlines" description="Dates and notice periods you should pay attention to.">
          {!a.deadlines?.length ? (
            <EmptyState text="No obvious deadlines were detected." />
          ) : (
            <div className="space-y-3">
              {a.deadlines.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold">
                      {item.deadline}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection id="risks" eyebrow="Review carefully" title="Clauses to Pay Attention To" description="Contract terms that may deserve closer attention.">
          {!a.risks?.length ? (
            <EmptyState text="No major risk-related clauses were detected." />
          ) : (
            <div className="space-y-4">
              {a.risks.map((item, index) => {
                const style = riskStyle(item.severity);

                return (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}>
                        {item.severity}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {item.explanation}
                    </p>

                    {item.agreement_text && (
                      <Quote text={item.agreement_text} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ReportSection>

        <motion.section id="negotiation" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.45 }} className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">Take action</p><h2 className="mt-1 text-[1.65rem] font-bold tracking-tight text-gray-950">What You Should Consider Negotiating</h2><p className="mt-2 text-sm text-gray-500">AI-generated suggestions based on the saved agreement.</p></div>
          <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">AI-generated</span>
        </div>
        {analysis.analysis.negotiation_suggestions?.length ? <div className="mt-6 space-y-4">{analysis.analysis.negotiation_suggestions.map((item,index)=><motion.div key={index} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.4,delay:Math.min(index*0.08,0.4)}} className="rounded-2xl border border-gray-200 bg-[#fafafa] p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">{index+1}</span><h3 className="pt-1 text-lg font-semibold text-gray-950">{item.title}</h3></div><span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">{item.priority} priority</span></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-gray-400">Current term</p><p className="mt-2 text-sm leading-6 text-gray-700">{cleanText(item.current_term)}</p></div><div className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-gray-400">Suggested change</p><p className="mt-2 text-sm font-medium leading-6 text-gray-900">{cleanText(item.suggestion)}</p></div></div><div className="mt-4 rounded-2xl bg-gray-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Why consider it?</p><p className="mt-2 text-sm leading-6 text-gray-300">{cleanText(item.reason)}</p></div></motion.div>)}</div> : <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">No specific negotiation points were identified.</div>}
      </motion.section>

      <motion.section id="legal-check" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.45 }} className="scroll-mt-36 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Tamil Nadu
            </p>
            <h2 className="mt-2 text-2xl font-bold">Tamil Nadu Legal Check</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Comparison against selected Tamil Nadu tenancy references.
            </p>
          </div>

          <div className="space-y-4 p-7 sm:p-8">
            {!a.legal_findings?.length ? (
              <EmptyState text="No specific Tamil Nadu legal findings were returned." />
            ) : (
              a.legal_findings.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.legal_reference || "Tamil Nadu tenancy reference"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${legalStyle(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                        {item.severity}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {item.explanation}
                  </p>

                  {item.agreement_text && <Quote text={item.agreement_text} />}

                  <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <span>Source: {item.source || "Official source"}</span>
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-800 underline underline-offset-4 hover:text-black"
                      >
                        View official source →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-6 text-gray-600">
              This legal check is informational only and is not a legal opinion.
              For important legal decisions or disputes, consult a qualified legal professional.
            </div>
          </div>
        </motion.section>

        <ReportSection id="clauses" eyebrow="Key terms" title="Important Clauses" description="Key parts of the agreement explained simply.">
          {!a.important_clauses?.length ? (
            <EmptyState text="No specific clauses were detected." />
          ) : (
            <div className="space-y-4">
              {a.important_clauses.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-500">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{item.explanation}</p>
                    </div>
                  </div>

                  {item.agreement_text && <Quote text={item.agreement_text} />}
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection id="agreement-text" eyebrow="Original text" title="Extracted Agreement" description="The text extracted from your uploaded PDF.">
          <div className="max-h-[550px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            {cleanText(analysis.text)}
          </div>
        </ReportSection>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm leading-6 text-gray-600 shadow-sm">
          <p className="font-semibold text-gray-950">Important Disclaimer</p>
          <p className="mt-2">
            SamjhoSign provides an AI-powered explanation of your rental agreement for informational purposes only.
            It is not legal advice and does not determine whether a clause is legally enforceable.
          </p>
        </div>
      </section>
    </motion.main>
  );
}

function ReportSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className="scroll-mt-36 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
        Agreement wording
      </p>
      <blockquote className="mt-2 border-l-2 border-gray-300 pl-4 text-sm italic leading-6 text-gray-600">
        "{cleanText(text)}"
      </blockquote>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
      {text}
    </div>
  );
}
