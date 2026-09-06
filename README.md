# SamjhoSign

### AI-Powered Rental Agreement Analyzer

SamjhoSign is an AI-powered web application designed to help tenants understand rental agreements before signing them.

Users can upload a rental agreement PDF and receive a structured analysis covering financial obligations, important deadlines, potential risks, important clauses, Tamil Nadu legal-reference checks, and practical negotiation suggestions.

## 🌐 Live Demo

**https://samjhosign.vercel.app**

## ✨ Features

- 📄 **PDF Rental Agreement Analysis** — Upload rental agreements directly from the browser with drag-and-drop support.
- 💰 **Financial Obligation Detection** — Identifies rent, security deposits, maintenance charges, penalties, and other monetary obligations.
- 📅 **Deadline Detection** — Extracts notice periods, payment deadlines, agreement dates, termination periods, and other important dates.
- ⚠️ **Risk Detection** — Highlights potentially unfavorable or unusual agreement terms that may require attention.
- ⚖️ **Tamil Nadu Legal Checks** — Checks relevant findings against configured Tamil Nadu legal references.
- 🤝 **Negotiation Suggestions** — Provides practical suggestions for terms that tenants may want to clarify or negotiate.
- 🔐 **Authentication** — User signup and login using Supabase.
- 🗂️ **Analysis History** — Authenticated users can save and revisit previous analyses.
- 📑 **Detailed Reports** — Each saved analysis has a dedicated report page.
- 🖨️ **PDF / Print Reports** — Analysis results can be exported through the browser's print-to-PDF functionality.
- 🎨 **Interactive UI** — Responsive design with animations, transitions, hover effects, and scroll-based interactions.

## 🧠 How It Works

```text
                         USER
                          │
                          │ Upload Rental Agreement PDF
                          ▼
                 ┌──────────────────┐
                 │  Next.js Frontend│
                 │  React + TS      │
                 └────────┬─────────┘
                          │
                          │ HTTP Request
                          ▼
                 ┌──────────────────┐
                 │  FastAPI Backend │
                 │  Python          │
                 └────────┬─────────┘
                          │
                          │ Document Analysis
                          ▼
                 ┌──────────────────┐
                 │   Google Gemini  │
                 │   AI Analysis    │
                 └────────┬─────────┘
                          │
                          │ Structured Results
                          ▼
                 ┌──────────────────┐
                 │ Analysis & Legal │
                 │ Reference Checks │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Next.js Results  │
                 │ + Reports        │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    Supabase      │
                 │ Auth + History   │
                 └──────────────────┘

🛠️ Tech Stack

Frontend

Next.js
React
TypeScript
Tailwind CSS
Motion
shadcn/ui
Supabase Client

Backend

Python
FastAPI
Uvicorn
Google Gemini API
PyPDF
python-multipart
python-dotenv

Database & Authentication

Supabase
PostgreSQL
Supabase Authentication
Row Level Security (RLS)

Deployment

Vercel — Frontend
Render — Backend

📁 Project Structure

samjhosign/
│
├── backend/
│   ├── main.py
│   ├── legal_reference.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── history/
│   │   │   └── [id]/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── hero.tsx
│   │   ├── navbar.tsx
│   │   └── upload-card.tsx
│   │
│   └── lib/
│       └── supabase/
│
├── data/
├── docs/
├── README.md
└── .gitignore

🚀 Getting Started
Prerequisites
Node.js
npm
Python 3.10+
Supabase project
Google Gemini API key
