from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from google import genai
from google.genai import types

import os
import json
import time


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("WARNING: GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

app = FastAPI(title="SamjhoSign API")


# ============================================================
# LIMITS
# ============================================================

MAX_FILE_SIZE = 10 * 1024 * 1024

MAX_ANALYSES_PER_IP = 5
RATE_LIMIT_WINDOW = 10 * 60

request_history = {}


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# RATE LIMITING
# ============================================================

def check_rate_limit(ip_address: str):
    current_time = time.time()

    previous_requests = request_history.get(ip_address, [])

    recent_requests = [
        timestamp
        for timestamp in previous_requests
        if current_time - timestamp < RATE_LIMIT_WINDOW
    ]

    if len(recent_requests) >= MAX_ANALYSES_PER_IP:
        request_history[ip_address] = recent_requests

        return False

    recent_requests.append(current_time)
    request_history[ip_address] = recent_requests

    return True


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "SamjhoSign backend is running"
    }


# ============================================================
# GEMINI ANALYSIS
# ============================================================

def analyze_pdf_with_ai(contents: bytes):

    prompt = """
You are SamjhoSign, an AI assistant that helps tenants
understand rental agreements.

The uploaded file is a rental agreement PDF.

IMPORTANT:
The PDF may be a normal text PDF OR a scanned/image PDF.

Read the actual contents of the PDF carefully, including
text visible inside scanned pages.

Your job is to:

1. Extract the agreement text as accurately as possible.
2. Analyze the agreement from the TENANT'S perspective.
3. Explain important terms in simple English.

============================================================
IMPORTANT RULES
============================================================

1. ONLY use information that appears in the uploaded PDF.

2. NEVER invent an amount, date, clause, responsibility,
   restriction, or legal requirement.

3. If something is not mentioned in the agreement, do not
   assume it exists.

4. If an important category is not mentioned, leave that
   category empty.

5. Explain complicated contract language in simple English.

6. Do not claim that a clause is legally enforceable or
   unenforceable.

7. Do not provide definitive legal advice.

8. Distinguish between:
   - What the agreement actually says
   - Why the tenant may want to pay attention to it

9. When quoting agreement text, only use wording that actually
   appears in the uploaded agreement.

10. Keep explanations concise and useful.

11. If the PDF is scanned, carefully read the visible text
    from the scanned pages.

12. Do not use information from outside the agreement.

============================================================
WHAT TO LOOK FOR
============================================================

FINANCIAL:
- Monthly rent
- Security deposit
- Advance rent
- Late-payment fees
- Penalties
- Maintenance charges
- Utility payments
- Additional fees
- Rent increases
- Deposit deductions
- Refund conditions

DEADLINES:
- Rent payment dates
- Notice periods
- Agreement start date
- Agreement end date
- Renewal deadlines
- Move-out deadlines
- Other important dates

TENANT RESPONSIBILITIES:
- Repairs
- Maintenance
- Utilities
- Cleaning
- Property damage
- Insurance
- Other obligations

RESTRICTIONS:
- Subletting
- Guests
- Pets
- Alterations
- Business use
- Occupancy limits
- Noise restrictions
- Other restrictions

TERMINATION:
- Early termination
- Notice requirements
- Penalties for leaving early
- Renewal conditions
- Automatic renewal
- Conditions for ending the agreement

LANDLORD RIGHTS:
- Property inspection
- Entry into the property
- Notice required before entry
- Other landlord permissions

RISK AREAS:
- Large financial penalties
- Broad tenant responsibilities
- Short notice periods
- Automatic renewal
- Strict termination conditions
- Deposit deduction conditions
- Restrictions that significantly affect the tenant
- Clauses that deserve clarification

============================================================
RISK ASSESSMENT
============================================================

Give an overall risk level:

"Low"
"Medium"
or
"High"

This is an AI assessment of potentially important or
unfavorable terms detected for the tenant.

It is NOT a determination of legal validity or enforceability.

LOW:
The agreement appears relatively straightforward based on
the clauses detected.

MEDIUM:
The agreement contains several terms that the tenant should
review carefully.

HIGH:
The agreement contains multiple significant financial,
termination, restriction, responsibility, or other potentially
unfavorable terms that deserve careful attention.

Do not call something high risk merely because it is common
in rental agreements.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

Do not use Markdown.

Do not include ```json.

Use EXACTLY this structure:

{
  "extracted_text": "The text of the rental agreement extracted from the PDF. Preserve the wording as accurately as possible. If the PDF contains multiple pages, include text from all readable pages.",

  "overall_risk": "Low | Medium | High",

  "summary": "A concise plain-English summary of the agreement from the tenant's perspective.",

  "financial_obligations": [
    {
      "title": "Short descriptive title",
      "amount": "Exact amount if stated, otherwise Not specified",
      "explanation": "Simple explanation of what the tenant must pay."
    }
  ],

  "deadlines": [
    {
      "title": "Short descriptive title",
      "deadline": "Exact date or notice period if stated",
      "explanation": "Simple explanation of why the deadline matters."
    }
  ],

  "risks": [
    {
      "title": "Short risk title",
      "severity": "Low | Medium | High",
      "explanation": "Simple explanation of why the tenant should pay attention.",
      "agreement_text": "Relevant wording copied from the agreement."
    }
  ],

  "important_clauses": [
    {
      "title": "Clause title",
      "explanation": "Simple explanation of what the clause means for the tenant.",
      "agreement_text": "Relevant wording copied from the agreement."
    }
  ]
}

============================================================
NOW ANALYZE THE UPLOADED RENTAL AGREEMENT PDF.
============================================================
"""

    pdf_part = types.Part.from_bytes(
        data=contents,
        mime_type="application/pdf",
    )

    for attempt in range(3):
        try:
            print(
                f"Sending PDF to Gemini "
                f"(attempt {attempt + 1}/3)..."
            )

            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=[
                    pdf_part,
                    prompt,
                ],
            )

            result_text = response.text.strip()

            if result_text.startswith("```"):
                result_text = result_text.replace("```json", "")
                result_text = result_text.replace("```", "")
                result_text = result_text.strip()

            result = json.loads(result_text)

            print("Gemini PDF analysis received successfully.")

            return result

        except json.JSONDecodeError:
            print("Gemini returned invalid JSON.")

            if attempt == 2:
                raise

            print("Retrying in 3 seconds...")
            time.sleep(3)

        except Exception as e:
            print(
                f"Gemini attempt {attempt + 1} failed:",
                repr(e)
            )

            if attempt == 2:
                raise

            print(
                "Gemini may be temporarily unavailable. "
                "Retrying in 3 seconds..."
            )

            time.sleep(3)


# ============================================================
# ANALYZE ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze_agreement(
    request: Request,
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # API KEY CHECK
    # --------------------------------------------------------

    if not os.getenv("GEMINI_API_KEY"):
        return {
            "error": (
                "GEMINI_API_KEY is missing. "
                "Add it to backend/.env."
            )
        }

    # --------------------------------------------------------
    # RATE LIMIT CHECK
    # --------------------------------------------------------

    client_ip = request.client.host if request.client else "unknown"

    if not check_rate_limit(client_ip):
        return JSONResponse(
            status_code=429,
            content={
                "error": (
                    "Too many analysis requests. "
                    "Please wait a few minutes before trying again."
                )
            },
        )

    # --------------------------------------------------------
    # FILE TYPE CHECK
    # --------------------------------------------------------

    if file.content_type != "application/pdf":
        return {
            "error": "Please upload a PDF file."
        }

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    try:
        contents = await file.read()

    except Exception:
        return {
            "error": "Could not read the uploaded file."
        }

    file_size = len(contents)

    print(f"Received PDF: {file.filename}")
    print(
        f"File size: "
        f"{file_size / (1024 * 1024):.2f} MB"
    )

    # --------------------------------------------------------
    # EMPTY FILE CHECK
    # --------------------------------------------------------

    if file_size == 0:
        return {
            "error": "The uploaded PDF is empty."
        }

    # --------------------------------------------------------
    # SIZE CHECK
    # --------------------------------------------------------

    if file_size > MAX_FILE_SIZE:
        return {
            "error": (
                "The PDF is too large. "
                "Please upload a PDF smaller than 10 MB."
            )
        }

    # --------------------------------------------------------
    # GEMINI ANALYSIS
    # --------------------------------------------------------

    try:
        analysis = analyze_pdf_with_ai(contents)

    except json.JSONDecodeError:
        print("ERROR: Gemini returned invalid JSON.")

        return {
            "error": (
                "Gemini returned an invalid analysis format. "
                "Please try again."
            )
        }

    except Exception as e:
        print(
            "ANALYSIS ERROR:",
            repr(e)
        )

        return {
            "error": (
                "AI analysis failed. "
                "Check the backend terminal for details."
            )
        }

    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

    extracted_text = analysis.get(
        "extracted_text",
        ""
    )

    return {
        "filename": file.filename,
        "pages": None,
        "text": extracted_text,
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