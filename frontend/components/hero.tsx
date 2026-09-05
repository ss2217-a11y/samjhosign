"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/upload-card";

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease,
    },
  },
};

const revealSlow = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const features = [
    [
      "₹",
      "Money & payments",
      "Rent, deposits, penalties, maintenance and increases.",
    ],
    [
      "⏱",
      "Deadlines & notice",
      "Notice periods, renewal dates and important deadlines.",
    ],
    [
      "!",
      "Potential risks",
      "Clauses that may create unusual obligations or concerns.",
    ],
    [
      "✓",
      "Responsibilities",
      "Repairs, utilities, maintenance and tenant duties.",
    ],
    [
      "#",
      "Restrictions",
      "Guests, pets, subletting, alterations and usage rules.",
    ],
    [
      "?",
      "Important clauses",
      "Key terms that deserve a closer look.",
    ],
  ];

  const steps = [
    {
      number: "01",
      label: "UPLOAD",
      title: "Give us your agreement",
      text: "Upload your rental agreement as a PDF and let SamjhoSign process it.",
    },
    {
      number: "02",
      label: "ANALYZE",
      title: "We find what matters",
      text: "Important financial terms, deadlines, responsibilities and risk areas are identified.",
    },
    {
      number: "03",
      label: "UNDERSTAND",
      title: "Know before you sign",
      text: "Get a simple explanation of the terms that deserve your attention.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: [0.95, 1.05, 0.98, 1],
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-280px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gray-100 blur-3xl"
        />

        <div className="samjho-grid absolute inset-0 opacity-20" />

        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[10%] top-[15%] h-32 w-32 rounded-full border border-gray-200"
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[8%] top-[42%] h-20 w-20 rounded-full border border-gray-200"
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* ============================================================
            HERO
        ============================================================ */}

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid min-h-[calc(100vh-64px)] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-24"
        >
          {/* LEFT */}

          <div className="max-w-2xl">
            <motion.div
              variants={reveal}
              whileHover={{
                y: -2,
                scale: 1.02,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
              }}
              className="mb-7 inline-flex cursor-default items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm"
            >
              <motion.span
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-2 w-2 rounded-full bg-gray-950"
              />

              Rental agreement intelligence
            </motion.div>

            <motion.h1
              variants={reveal}
              className="text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[5.4rem]"
            >
              Know what
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.55,
                  duration: 0.8,
                }}
                className="inline-block"
              >
                you're signing.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8"
            >
              SamjhoSign reads your rental agreement and surfaces the money,
              deadlines, responsibilities, restrictions, and potential risks
              that actually matter.
            </motion.p>

            {/* CTA */}

            <motion.div
              variants={reveal}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <Button
                  size="lg"
                  className="samjho-button group h-13 w-full rounded-xl px-7 text-base shadow-lg shadow-black/10 sm:w-auto"
                  onClick={() => scrollTo("upload-agreement")}
                >
                  Analyze my agreement

                  <motion.span
                    className="ml-2 inline-block text-lg"
                    animate={{
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="samjho-button h-13 w-full rounded-xl border-gray-200 bg-white px-7 text-base sm:w-auto"
                  onClick={() => scrollTo("how-it-works")}
                >
                  See how it works
                </Button>
              </motion.div>
            </motion.div>

            {/* TRUST */}

            <motion.div
              variants={reveal}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500"
            >
              {[
                "Plain English",
                "Risk insights",
                "Important deadlines",
                "Financial terms",
              ].map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.8 + index * 0.08,
                    duration: 0.4,
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="font-semibold text-gray-900">✓</span>
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* ============================================================
              RIGHT — PRODUCT PREVIEW
          ============================================================ */}

          <motion.div
            variants={revealSlow}
            className="relative mx-auto w-full max-w-[500px] lg:mx-0 lg:ml-auto"
          >
            {/* Decorative circles */}

            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.08, 1],
              }}
              transition={{
                rotate: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gray-100 blur-2xl"
            />

            <motion.div
              animate={{
                y: [0, -8, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <motion.div
                whileHover={{
                  y: -8,
                  rotateX: 1,
                  rotateY: -1,
                  scale: 1.01,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                }}
                className="samjho-float relative rounded-[2rem] border border-gray-200 bg-white p-3 shadow-2xl shadow-black/10"
              >
                {/* Browser header */}

                <div className="flex items-center justify-between rounded-t-[1.5rem] border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((dot) => (
                      <motion.div
                        key={dot}
                        animate={{
                          opacity: [0.45, 0.8, 0.45],
                        }}
                        transition={{
                          duration: 2,
                          delay: dot * 0.2,
                          repeat: Infinity,
                        }}
                        className="h-2.5 w-2.5 rounded-full bg-gray-300"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-medium text-gray-400">
                    SamjhoSign analysis
                  </span>
                </div>

                {/* Report */}

                <div className="p-5 sm:p-7">
                  {/* File */}

                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{
                          rotate: -5,
                          scale: 1.08,
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-xs font-bold text-white"
                      >
                        PDF
                      </motion.div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          rental-agreement.pdf
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Agreement analysis
                        </p>
                      </div>
                    </div>

                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 1.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      Analyzed
                    </motion.span>
                  </motion.div>

                  {/* Risk summary */}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.65,
                      duration: 0.6,
                    }}
                    className="mt-7 rounded-2xl bg-gray-950 p-5 text-white"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Overall assessment
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                          Review carefully
                        </p>
                      </div>

                      <motion.div
                        animate={{
                          scale: [1, 1.08, 1],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm"
                      >
                        !
                      </motion.div>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "58%" }}
                        transition={{
                          delay: 1,
                          duration: 1.1,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-white"
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-400">
                      A few terms deserve your attention before signing.
                    </p>
                  </motion.div>

                  {/* Metrics */}

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ["Money", "₹18k", "monthly rent"],
                      ["Notice", "60d", "notice period"],
                      ["Attention", "3", "key areas"],
                    ].map(([label, value, sub], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.85 + index * 0.1,
                          duration: 0.5,
                        }}
                        whileHover={{
                          y: -5,
                          scale: 1.025,
                        }}
                        className="cursor-default rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-lg hover:shadow-black/5"
                      >
                        <p className="text-xs text-gray-400">{label}</p>

                        <p className="mt-2 text-lg font-bold text-gray-950">
                          {value}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {sub}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Findings */}

                  <div className="mt-5 space-y-3">
                    {[
                      [
                        "₹",
                        "Security deposit",
                        "Financial obligation identified",
                      ],
                      [
                        "!",
                        "Termination clause",
                        "Important condition found",
                      ],
                    ].map(([icon, title, description], index) => (
                      <motion.div
                        key={title}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 1.15 + index * 0.15,
                          duration: 0.5,
                        }}
                        whileHover={{
                          x: 5,
                          scale: 1.01,
                        }}
                        className="flex cursor-default items-center gap-3 rounded-xl border border-gray-200 p-3.5 transition-shadow hover:shadow-md"
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: 4,
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold"
                        >
                          {icon}
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {title}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {description}
                          </p>
                        </div>

                        <span className="text-xs font-medium text-gray-500">
                          Review
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating label */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: -20,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  delay: 1.3,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                }}
                whileHover={{
                  y: -5,
                  scale: 1.03,
                }}
                className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl sm:block"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white"
                  >
                    ✓
                  </motion.div>

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Simple explanations
                    </p>

                    <p className="text-[11px] text-gray-400">
                      No legal jargon
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ============================================================
            UPLOAD
        ============================================================ */}

        <motion.div
          id="upload-agreement"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.8,
            ease,
          }}
          className="scroll-mt-24 pb-32"
        >
          <motion.div
            whileHover={{
              y: -2,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 25,
            }}
            className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 sm:p-8 lg:p-10"
          >
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                  Start your review
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-4xl">
                  Upload your agreement
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Drop your rental agreement below and we'll break down the
                  terms that matter to you.
                </p>
              </div>

              <motion.div
                whileHover={{
                  scale: 1.03,
                }}
                className="hidden rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-500 sm:block"
              >
                PDF · Max 10 MB
              </motion.div>
            </div>

            <div className="mx-auto max-w-4xl">
              <UploadCard />
            </div>
          </motion.div>
        </motion.div>

        {/* ============================================================
            WHAT WE CHECK
        ============================================================ */}

        <motion.div
          id="what-we-check"
          className="scroll-mt-24 border-t border-gray-200 py-28"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
          variants={stagger}
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div variants={reveal}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                What we look for
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-5xl">
                The details that actually matter.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                SamjhoSign focuses on the parts of a rental agreement that can
                have the biggest impact on you.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid gap-3 sm:grid-cols-2"
            >
              {features.map(([icon, title, description]) => (
                <motion.div
                  key={title}
                  variants={reveal}
                  whileHover={{
                    y: -6,
                    scale: 1.015,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                  className="samjho-card cursor-default rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{
                        rotate: -5,
                        scale: 1.1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white"
                    >
                      {icon}
                    </motion.div>

                    <h3 className="font-semibold text-gray-950">{title}</h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-500">
                    {description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================================
            HOW IT WORKS
        ============================================================ */}

        <motion.div
          id="how-it-works"
          className="scroll-mt-24 border-t border-gray-200 py-28"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
          variants={stagger}
        >
          <motion.div
            variants={reveal}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-gray-950 sm:text-5xl">
              Three steps to clarity.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={reveal}
                whileHover={{
                  y: -7,
                  scale: 1.015,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                }}
                className="samjho-card cursor-default rounded-3xl p-8"
              >
                <div className="flex items-center justify-between">
                  <motion.span
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white"
                  >
                    {step.number}
                  </motion.span>

                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400">
                    {step.label}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold text-gray-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {step.text}
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.25,
                    duration: 0.7,
                  }}
                  className="mt-7 h-px bg-gray-200"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ============================================================
            FINAL CTA
        ============================================================ */}

        <motion.div
          className="py-20"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
            ease,
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.005,
            }}
            className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-7 py-16 text-white sm:px-12 sm:py-24"
          >
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  Before you sign
                </p>

                <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Don't sign what you don't understand.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  Get a clearer picture of your rental agreement in minutes.
                </p>
              </div>

              <motion.div
                whileHover={{
                  y: -4,
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="samjho-button h-13 rounded-xl px-8 text-base"
                  onClick={() => scrollTo("upload-agreement")}
                >
                  Analyze my agreement

                  <motion.span
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="ml-2 inline-block text-lg"
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <footer className="border-t border-gray-200 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
            >
              <Link
                href="/"
                className="text-xl font-bold tracking-[-0.035em] text-gray-950"
              >
                SamjhoSign
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
                Understand your rental agreement before you sign. Complicated
                contract language, explained simply.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold text-gray-900">Product</p>

              <div className="mt-4 space-y-3">
                <button
                  onClick={() => scrollTo("upload-agreement")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  Analyze agreement
                </button>

                <button
                  onClick={() => scrollTo("what-we-check")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  What we check
                </button>

                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="block text-left text-sm text-gray-500 transition hover:text-gray-900"
                >
                  How it works
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold text-gray-900">Important</p>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                SamjhoSign provides AI-powered explanations for informational
                purposes. It does not provide legal advice or determine whether
                a clause is legally enforceable.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SamjhoSign. All rights reserved.</p>

            <p>Built to help tenants understand before they sign.</p>
          </div>
        </footer>
      </div>
    </section>
  );
}