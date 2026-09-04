import os
import json
import time
from collections import defaultdict
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from pypdf import PdfReader


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(api_key=GEMINI_API_KEY)

# Try these models in order.
# If one is temporarily overloaded, the next one will be tried.
MODEL_NAMES = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
]


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="SamjhoSign API",
    description="Rental agreement analysis API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://samjhosign.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SETTINGS
# ============================================================

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

RATE_LIMIT = 5
RATE_WINDOW_MINUTES = 10

request_history = defaultdict(list)


# ============================================================
# RATE LIMITING
# ============================================================

def check_rate_limit(ip_address: str) -> bool:
    now = datetime.now()

    cutoff = now - timedelta(minutes=RATE_WINDOW_MINUTES)

    request_history[ip_address] = [
        timestamp
        for timestamp in request_history[ip_address]
        if timestamp > cutoff
    ]

    if len(request_history[ip_address]) >= RATE_LIMIT:
        return False

    request_history[ip_address].append(now)

    return True


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "message": "SamjhoSign backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# GEMINI PROMPT
# ============================================================

ANALYSIS_PROMPT = """
You are SamjhoSign, an AI assistant that explains rental agreements
in simple language.

Analyze the provided rental agreement carefully.

Your job is to identify important financial obligations, deadlines,
risks, responsibilities, restrictions, and important clauses.

IMPORTANT RULES:

1. Only use information actually present in the agreement.
2. Do not invent amounts, dates, clauses, penalties, or obligations.
3. If something is not mentioned, do not assume it exists.
4. Quote or closely reproduce the relevant agreement wording when
   providing agreement_text.
5. Explain everything in simple language suitable for a normal renter.
6. Clearly distinguish between ordinary obligations and potential risks.
7. Be especially careful with:
   - Security deposit
   - Rent
   - Maintenance
   - Late fees
   - Notice periods
   - Lock-in periods
   - Renewal
   - Termination
   - Penalties
   - Restrictions
   - Repairs
   - Utilities
   - Subletting
   - Landlord entry
   - Dispute clauses
   - Other unusual obligations

Return ONLY valid JSON.

Use exactly this structure:

{
  "extracted_text": "The text/content of the agreement",
  "overall_risk": "Low | Medium | High",
  "summary": "Simple summary of the agreement",
  "financial_obligations": [
    {
      "title": "Short title",
      "amount": "Amount or relevant value",
      "explanation": "Simple explanation"
    }
  ],
  "deadlines": [
    {
      "title": "Short title",
      "deadline": "Date or time period",
      "explanation": "Simple explanation"
    }
  ],
  "risks": [
    {
      "title": "Short title",
      "severity": "Low | Medium | High",
      "explanation": "Simple explanation of why this may matter",
      "agreement_text": "Relevant wording from the agreement"
    }
  ],
  "important_clauses": [
    {
      "title": "Short title",
      "explanation": "Simple explanation",
      "agreement_text": "Relevant wording from the agreement"
    }
  ]
}

For empty categories, return [].

Do not add markdown fences.
Do not add explanations outside the JSON.
"""


# ============================================================
# JSON CLEANING
# ============================================================

def clean_json_response(text: str) -> str:
    text = text.strip()

    # Remove markdown code fences if Gemini adds them.
    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


# ============================================================
# NORMALIZE ANALYSIS
# ============================================================

def normalize_analysis(data: dict, extracted_text: str) -> dict:
    return {
        "extracted_text": data.get(
            "extracted_text",
            extracted_text
        ),

        "overall_risk": data.get(
            "overall_risk",
            "Medium"
        ),

        "summary": data.get(
            "summary",
            ""
        ),

        "financial_obligations": data.get(
            "financial_obligations",
            []
        ),

        "deadlines": data.get(
            "deadlines",
            []
        ),

        "risks": data.get(
            "risks",
            []
        ),

        "important_clauses": data.get(
            "important_clauses",
            []
        ),
    }


# ============================================================
# GEMINI ANALYSIS WITH FALLBACK
# ============================================================

def analyze_with_gemini(
    pdf_bytes: bytes,
    extracted_text: str
) -> dict:

    last_error = None

    pdf_part = types.Part.from_bytes(
        data=pdf_bytes,
        mime_type="application/pdf"
    )

    for model_name in MODEL_NAMES:

        print(f"Trying Gemini model: {model_name}")

        try:

            response = client.models.generate_content(
                model=model_name,
                contents=[
                    pdf_part,
                    ANALYSIS_PROMPT
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )

            if not response.text:
                raise RuntimeError(
                    f"{model_name} returned an empty response"
                )

            cleaned = clean_json_response(response.text)

            data = json.loads(cleaned)

            return normalize_analysis(
                data,
                extracted_text
            )

        except Exception as error:

            last_error = error

            error_text = str(error)

            print(
                f"Gemini error with {model_name}: "
                f"{error_text}"
            )

            # These are temporary/server-side errors.
            # Move to the next model.
            transient_error = any(
                code in error_text
                for code in [
                    "503",
                    "UNAVAILABLE",
                    "429",
                    "RESOURCE_EXHAUSTED",
                    "500",
                    "502",
                    "504",
                    "INTERNAL",
                ]
            )

            # Model not available for this account.
            # Also move to the next model.
            model_unavailable = any(
                code in error_text
                for code in [
                    "404",
                    "NOT_FOUND",
                    "not available",
                    "no longer available",
                ]
            )

            if transient_error or model_unavailable:

                # Small delay before trying another model.
                time.sleep(2)

                continue

            # For unexpected errors, stop immediately.
            raise error

    raise RuntimeError(
        "All Gemini models are currently unavailable. "
        f"Last error: {last_error}"
    )


# ============================================================
# ANALYZE ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze(
    request: Request,
    file: UploadFile = File(...)
):

    client_ip = request.client.host if request.client else "unknown"

    # --------------------------------------------------------
    # RATE LIMIT
    # --------------------------------------------------------

    if not check_rate_limit(client_ip):

        return JSONResponse(
            status_code=200,
            content={
                "error": (
                    "Too many analysis requests. "
                    "Please wait a few minutes and try again."
                )
            },
        )

    # --------------------------------------------------------
    # FILE TYPE
    # --------------------------------------------------------

    if not file.filename:
        return JSONResponse(
            status_code=200,
            content={
                "error": "Please select a PDF file."
            },
        )

    if not file.filename.lower().endswith(".pdf"):
        return JSONResponse(
            status_code=200,
            content={
                "error": "Only PDF files are supported."
            },
        )

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    try:
        pdf_bytes = await file.read()

    except Exception as error:

        print(f"File read error: {error}")

        return JSONResponse(
            status_code=200,
            content={
                "error": "Could not read the uploaded file."
            },
        )

    # --------------------------------------------------------
    # FILE SIZE
    # --------------------------------------------------------

    if len(pdf_bytes) > MAX_FILE_SIZE:

        return JSONResponse(
            status_code=200,
            content={
                "error": "PDF must be smaller than 10 MB."
            },
        )

    if len(pdf_bytes) == 0:

        return JSONResponse(
            status_code=200,
            content={
                "error": "The uploaded PDF is empty."
            },
        )

    # --------------------------------------------------------
    # PDF INFORMATION
    # --------------------------------------------------------

    pages = 0
    extracted_text = ""

    try:

        from io import BytesIO

        reader = PdfReader(
            BytesIO(pdf_bytes)
        )

        pages = len(reader.pages)

        text_parts = []

        for page in reader.pages:

            try:
                page_text = page.extract_text()

                if page_text:
                    text_parts.append(page_text)

            except Exception:
                continue

        extracted_text = "\n\n".join(
            text_parts
        ).strip()

    except Exception as error:

        print(f"PDF parsing error: {error}")

        # Gemini can still analyze the PDF directly,
        # including scanned/image PDFs.
        pages = 0
        extracted_text = ""

    # --------------------------------------------------------
    # GEMINI
    # --------------------------------------------------------

    try:

        analysis = analyze_with_gemini(
            pdf_bytes=pdf_bytes,
            extracted_text=extracted_text,
        )

        return {
            "filename": file.filename,
            "pages": pages,
            "text": analysis.get(
                "extracted_text",
                extracted_text
            ),
            "analysis": {
                "overall_risk": analysis.get(
                    "overall_risk",
                    "Medium"
                ),
                "summary": analysis.get(
                    "summary",
                    ""
                ),
                "financial_obligations": analysis.get(
                    "financial_obligations",
                    []
                ),
                "deadlines": analysis.get(
                    "deadlines",
                    []
                ),
                "risks": analysis.get(
                    "risks",
                    []
                ),
                "important_clauses": analysis.get(
                    "important_clauses",
                    []
                ),
            },
        }

    except Exception as error:

        print(
            f"ANALYSIS ERROR: {repr(error)}"
        )

        return JSONResponse(
            status_code=200,
            content={
                "error": (
                    "Gemini is temporarily unavailable. "
                    "Please try again in a few minutes."
                )
            },
        )