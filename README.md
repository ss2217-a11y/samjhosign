# SamjhoSign

### AI-Powered Rental Agreement Analyzer

SamjhoSign is an AI-powered web application designed to help tenants understand rental agreements before signing them.

Users can upload a rental agreement PDF and receive a structured analysis covering financial obligations, important deadlines, potential risks, important clauses, Tamil Nadu legal-reference checks, and practical negotiation suggestions.

## 🌐 Live Demo

**https://samjhosign.vercel.app**

## ✨ Features

### 📄 Rental Agreement Analysis

- Upload rental agreements in PDF format.
- Supports drag-and-drop file uploads.
- Extracts and analyzes agreement content using AI.

### 💰 Financial Obligation Detection

Identifies important monetary terms such as:

- Monthly rent
- Security deposit
- Maintenance charges
- Penalties
- Other financial obligations

### 📅 Deadline Detection

Identifies important time-related information such as:

- Notice periods
- Payment deadlines
- Agreement dates
- Termination periods
- Other important deadlines

### ⚠️ Risk Detection

Highlights potentially unfavorable or unusual terms in the agreement and explains why they may require attention.

### ⚖️ Tamil Nadu Legal Checks

Checks relevant agreement findings against configured Tamil Nadu legal references.

The application distinguishes between:

- Relevant legal-reference matches
- Items requiring attention
- Information that may require further professional review

### 🤝 Negotiation Suggestions

Provides practical suggestions for terms that a tenant may want to clarify or negotiate, including areas such as:

- Security deposits
- Notice periods
- Penalties
- Repairs and maintenance
- Termination conditions
- Property-entry clauses
- Other potentially negotiable terms

### 🔐 Authentication

Users can:

- Create an account
- Sign in securely
- Sign out
- Access their own analysis history

Authentication is powered by Supabase.

### 🗂️ Analysis History

Authenticated users can save and revisit previous rental agreement analyses.

### 📑 Detailed Reports

Each saved analysis has a dedicated report page containing the analysis results.

### 🖨️ PDF / Print Reports

Analysis results can be exported using the browser's print-to-PDF functionality.

### 🎨 Interactive User Interface

The application includes:

- Responsive design
- Modern SaaS-style interface
- Smooth animations
- Page transitions
- Hover interactions
- Scroll-based animations
- Drag-and-drop interactions

## 🧠 How It Works

```text
                         USER
                          │
                          │ Upload PDF
                          ▼
                 ┌──────────────────┐
                 │  Next.js Frontend │
                 │  React + TS       │
                 └────────┬─────────┘
                          │
                          │ HTTP Request
                          ▼
                 ┌──────────────────┐
                 │ FastAPI Backend  │
                 │ Python           │
                 └────────┬─────────┘
                          │
                          │ Document Analysis
                          ▼
                 ┌──────────────────┐
                 │   Google Gemini  │
                 │   AI Analysis    │
                 └────────┬─────────┘
                          │
                          │ Structured JSON
                          ▼
                 ┌──────────────────┐
                 │ Analysis Engine  │
                 │                  │
                 │ • Financial      │
                 │ • Deadlines      │
                 │ • Risks          │
                 │ • Clauses        │
                 │ • Legal Checks   │
                 │ • Negotiation    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Next.js Frontend │
                 │ Results + Report │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    Supabase      │
                 │                  │
                 │ Authentication   │
                 │ Analysis History │
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
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx
│   │   ├── hero.tsx
│   │   ├── navbar.tsx
│   │   └── upload-card.tsx
│   │
│   ├── lib/
│   │   └── supabase/
│   │       └── client.ts
│   │
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── data/
├── docs/
├── README.md
└── .gitignore
🚀 Getting Started
Prerequisites

Make sure you have the following installed:

Node.js
npm
Python 3.10 or later
A Supabase project
A Google Gemini API key