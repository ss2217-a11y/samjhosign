import os
import json
import time
from collections import defaultdict
from datetime import datetime, timedelta
from io import BytesIO

from dotenv import load_dotenv
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from pypdf import PdfReader

from legal_reference import (
    format_references_for_gemini,
    get_all_references,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")


# ============================================================
# GEMINI
# ============================================================

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAMES = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
]


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="SamjhoSign API",
    description="Rental agreement analysis API",
    version="1.7.0",
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

MAX_FILE_SIZE = 10 * 1024 * 1024

RATE_LIMIT = 5
RATE_WINDOW_MINUTES = 10

request_history = defaultdict(list)


# ============================================================
# RATE LIMITING
# ============================================================

def check_rate_limit(ip_address: str) -> bool:
    now = datetime.now()

    cutoff = now - timedelta(
        minutes=RATE_WINDOW_MINUTES
    )

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
# HEALTH
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
# TAMIL NADU REFERENCES
# ============================================================

TN_LEGAL_REFERENCE = format_references_for_gemini()

ALL_TN_REFERENCES = get_all_references()


# ============================================================
# LEGAL REFERENCE MATCHING
# ============================================================

def find_reference_for_finding(
    legal_reference: str,
    title: str,
):
    reference_text = (
        legal_reference or ""
    ).lower().strip()

    title_text = (
        title or ""
    ).lower().strip()

    best_match = None
    best_score = 0

    for reference in ALL_TN_REFERENCES:
        score = 0

        reference_full_text = " ".join(
            [
                str(reference.get("id", "")),
                str(reference.get("title", "")),
                str(reference.get("topic", "")),
                str(reference.get("section", "")),
                str(reference.get("rule", "")),
                str(reference.get("reference", "")),
            ]
        ).lower()

        reference_title = str(
            reference.get("title", "")
        ).lower()

        reference_topic = str(
            reference.get("topic", "")
        ).lower()

        reference_section = str(
            reference.get("section", "")
        ).lower()

        reference_rule = str(
            reference.get("rule", "")
        ).lower()

        reference_reference = str(
            reference.get("reference", "")
        ).lower()

        if (
            reference_section
            and reference_section in reference_text
        ):
            score += 8

        if (
            reference_rule
            and reference_rule != "none"
            and reference_rule in reference_text
        ):
            score += 6

        if (
            reference_title
            and (
                reference_title in title_text
                or title_text in reference_title
            )
        ):
            score += 6

        if (
            reference_topic
            and reference_topic in title_text
        ):
            score += 4

        title_words = [
            word
            for word in title_text.split()
            if len(word) > 3
        ]

        for word in title_words:
            if word in reference_title:
                score += 2

            if word in reference_full_text:
                score += 1

        if (
            reference_reference
            and reference_reference in reference_text
        ):
            score += 8

        if score > best_score:
            best_score = score
            best_match = reference

    return best_match


# ============================================================
# LEGAL FINDING NORMALIZATION
# ============================================================

def normalize_legal_findings(findings):
    if not isinstance(findings, list):
        return []

    normalized = []

    allowed_statuses = {
        "Attention",
        "Potentially inconsistent",
        "Generally consistent",
        "Not enough information",
    }

    allowed_severities = {
        "Low",
        "Medium",
        "High",
    }

    for finding in findings:
        if not isinstance(finding, dict):
            continue

        title = str(
            finding.get("title", "")
        ).strip()

        if not title:
            continue

        status = str(
            finding.get(
                "status",
                "Attention"
            )
        ).strip()

        if status not in allowed_statuses:
            status = "Attention"

        severity = str(
            finding.get(
                "severity",
                "Low"
            )
        ).strip()

        if severity not in allowed_severities:
            severity = "Low"

        explanation = str(
            finding.get(
                "explanation",
                ""
            )
        ).strip()

        agreement_text = str(
            finding.get(
                "agreement_text",
                ""
            )
        ).strip()

        legal_reference = str(
            finding.get(
                "legal_reference",
                ""
            )
        ).strip()

        source = str(
            finding.get(
                "source",
                ""
            )
        ).strip()

        source_url = str(
            finding.get(
                "source_url",
                ""
            )
        ).strip()

        matched_reference = find_reference_for_finding(
            legal_reference,
            title,
        )

        if matched_reference:
            verified_reference = str(
                matched_reference.get(
                    "reference",
                    legal_reference,
                )
            ).strip()

            verified_source = str(
                matched_reference.get(
                    "source_name",
                    source,
                )
            ).strip()

            verified_url = str(
                matched_reference.get(
                    "source_url",
                    source_url,
                )
            ).strip()

            if verified_reference:
                legal_reference = verified_reference

            if verified_source:
                source = verified_source

            if verified_url:
                source_url = verified_url

        # ----------------------------------------------------
        # Registration safety
        # ----------------------------------------------------

        registration_title = title.lower()

        if "registration" in registration_title:
            lower_explanation = explanation.lower()

            if (
                "automatically invalid"
                in lower_explanation
                or
                "automatically inadmissible"
                in lower_explanation
            ):
                explanation = (
                    "The agreement does not establish whether "
                    "the required Rent Authority registration "
                    "was completed. Consider verifying the "
                    "registration status and TR number, if applicable."
                )

            explanation = explanation.replace(
                "Failure to register may affect the admissibility "
                "of the agreement as evidence in court.",
                "The document itself does not establish whether "
                "the required Rent Authority registration was completed. "
                "Consider verifying the registration status and TR number, "
                "if applicable.",
            )

            explanation = explanation.replace(
                "failure to register may affect the admissibility "
                "of the agreement as evidence in court.",
                "The document itself does not establish whether "
                "the required Rent Authority registration was completed. "
                "Consider verifying the registration status and TR number, "
                "if applicable.",
            )

        normalized.append(
            {
                "title": title,
                "status": status,
                "severity": severity,
                "explanation": explanation,
                "agreement_text": agreement_text,
                "legal_reference": legal_reference,
                "source": source,
                "source_url": source_url,
            }
        )

    return normalized


# ============================================================
# NEGOTIATION NORMALIZATION
# ============================================================

def normalize_negotiation_suggestions(
    suggestions
):
    if not isinstance(suggestions, list):
        return []

    normalized = []

    allowed_priorities = {
        "Low",
        "Medium",
        "High",
    }

    for suggestion in suggestions[:5]:
        if not isinstance(suggestion, dict):
            continue

        title = str(
            suggestion.get(
                "title",
                ""
            )
        ).strip()

        current_term = str(
            suggestion.get(
                "current_term",
                ""
            )
        ).strip()

        proposed_change = str(
            suggestion.get(
                "suggestion",
                ""
            )
        ).strip()

        reason = str(
            suggestion.get(
                "reason",
                ""
            )
        ).strip()

        priority = str(
            suggestion.get(
                "priority",
                "Medium"
            )
        ).strip()

        if priority not in allowed_priorities:
            priority = "Medium"

        if not title:
            continue

        if not proposed_change:
            continue

        if not reason:
            continue

        normalized.append(
            {
                "title": title,
                "priority": priority,
                "current_term": current_term,
                "suggestion": proposed_change,
                "reason": reason,
            }
        )

    # Remove duplicate titles.
    unique = []
    seen_titles = set()

    for item in normalized:
        key = item["title"].lower()

        if key in seen_titles:
            continue

        seen_titles.add(key)
        unique.append(item)

    return unique[:5]


# ============================================================
# GEMINI PROMPT
# ============================================================

ANALYSIS_PROMPT = f"""
You are SamjhoSign, an AI assistant that explains rental and
tenancy agreements in simple language.

Analyze the provided rental agreement carefully.

Your goal is to help a normal tenant understand what the agreement
actually says BEFORE they sign it.

============================================================
CORE RULES
============================================================

1. Only use information actually present in the agreement.

2. Do not invent amounts, dates, clauses, penalties,
   obligations, parties, or facts.

3. If something is not mentioned, do not assume it exists.

4. Quote or closely reproduce relevant agreement wording when
   providing agreement_text.

5. Explain everything in simple language.

6. Clearly distinguish ordinary contractual obligations from
   genuine risks.

7. Do not provide a definitive legal opinion.

8. Do not automatically call a clause illegal.

9. Never state that a clause is unenforceable unless the supplied
   legal reference clearly supports that conclusion.

10. Do not make assumptions simply because a term is common in
    rental agreements.

11. Do not invent Tamil Nadu legal sections, rules, sources,
    notifications, or URLs.

12. For Tamil Nadu-specific legal checks, ONLY use the supplied
    references below.

============================================================
AREAS TO ANALYZE
============================================================

Pay particular attention to:

- Security deposit
- Rent
- Rent increases
- Late payment
- Maintenance
- Repairs
- Notice periods
- Lock-in periods
- Renewal
- Termination
- Penalties
- Restrictions
- Utilities
- Subletting
- Assignment
- Landlord entry
- Essential services
- Disputes
- Registration
- Stamp duty
- Tenancy period
- Unusual obligations

============================================================
TAMIL NADU LEGAL REFERENCES
============================================================

{TN_LEGAL_REFERENCE}

============================================================
SECURITY DEPOSIT
============================================================

When analyzing the security deposit:

- Do not automatically call a deposit above three months' rent illegal.
- Consider the supplied reference's "save an agreement to the contrary"
  wording.
- If monthly rent and deposit are both known, calculate the comparison.
- Explain the difference clearly.
- If the agreement expressly specifies a higher deposit, describe it
  as an issue worth reviewing rather than declaring it invalid.
- Use "Attention" when appropriate.
- Use "Generally consistent" when the available facts support that.
- Use "Not enough information" when the document does not contain
  enough facts.

============================================================
RENT AUTHORITY REGISTRATION
============================================================

If the agreement does not mention registration:

- Do not claim the agreement is automatically invalid.
- Do not claim it is automatically inadmissible.
- Explain that the supplied references provide for registration.
- Mention the 90-day requirement only when relevant.
- Distinguish the agreement itself from whether registration was
  actually completed.
- Prefer "Not enough information" when the document does not establish
  registration status.

============================================================
LANDLORD ENTRY
============================================================

Check whether the agreement contains an entry or inspection clause.

If it contains one:

- Explain what notice it provides.
- Compare it with the supplied reference.
- If a statutory timing detail is missing, do not automatically call
  the clause unlawful.
- Use "Attention" if the omission creates a meaningful review issue.

If there is no entry clause:

- Prefer "Not enough information".
- Do not treat the absence itself as a legal violation.

============================================================
LEGAL FINDING STATUS
============================================================

Use these statuses carefully:

"Generally consistent"
= the agreement contains a relevant clause and the available wording
appears consistent with the supplied reference.

"Attention"
= a relevant clause exists but is incomplete, ambiguous, unusual,
or needs review.

"Potentially inconsistent"
= the agreement appears to conflict with a supplied reference and
the reference actually supports that comparison.

"Not enough information"
= the document does not contain enough information to make the
comparison.

Do NOT default every legal topic to "Attention".

Do NOT create legal findings merely because a legal reference exists.

============================================================
PRACTICAL AI NEGOTIATION SUGGESTIONS
============================================================

This is an important part of the analysis.

Identify practical things a tenant could consider asking the landlord
to change, clarify, or document BEFORE signing.

These suggestions are NOT legal advice.

The suggestions must be based directly on the actual agreement.

============================================================
WHEN TO SUGGEST NEGOTIATION
============================================================

Only suggest negotiation when there is a meaningful reason.

Good candidates include:

- unusually high security deposit
- unusually large or unclear fees
- aggressive late-payment penalties
- short notice periods
- long lock-in periods
- unclear termination rights
- one-sided termination rights
- unclear repair responsibilities
- unusually broad tenant liability
- landlord access without a clear notice process
- unclear utility responsibilities
- restrictive subletting language
- unclear renewal terms
- large rent increases
- unusual deductions from the deposit
- unclear refund timing
- excessive notice requirements
- ambiguous obligations
- terms that create avoidable financial exposure

Do NOT suggest negotiation merely because a clause exists.

Do NOT suggest changing normal and reasonable terms just to produce
more suggestions.

If the agreement looks reasonable in an area, do not invent a
negotiation issue.

============================================================
NEGOTIATION QUALITY RULES
============================================================

For every negotiation suggestion:

1. Reference the actual current agreement term.

2. Do not invent an amount.

3. Do not invent a date.

4. Do not invent a missing clause.

5. Make the suggested change realistic.

6. Prefer a specific request over vague advice.

7. Explain the practical benefit to the tenant.

8. Do not describe a negotiation suggestion as a legal requirement.

9. Do not say "the landlord must" unless the supplied legal reference
   clearly establishes that requirement.

10. If the issue is uncertain, suggest asking for clarification rather
    than demanding a change.

11. Prefer negotiation points that could materially affect:
    - money
    - flexibility
    - notice
    - deposit
    - repairs
    - termination
    - renewal
    - access
    - penalties
    - tenant responsibilities

12. Return between 0 and 5 suggestions.

13. Rank suggestions:
    High = potentially significant financial, flexibility, or liability
    impact.

    Medium = useful protection or meaningful clarification.

    Low = minor convenience or clarity improvement.

14. Do not give five suggestions just because the output allows five.

15. Quality is more important than quantity.

============================================================
EXAMPLES OF GOOD NEGOTIATION LOGIC
============================================================

Example 1:

If the agreement explicitly says:

"Security deposit: Rs.1,00,000"
and rent is Rs.18,000/month,

you may suggest:

Title:
"Security Deposit Reduction"

Current term:
"Rs.1,00,000 refundable security deposit."

Suggestion:
"Ask whether the deposit can be reduced to a lower amount,
such as 2–3 months' rent."

Reason:
"This would reduce the upfront amount you need to pay."

Do not claim that the landlord is legally required to reduce it.

Example 2:

If the agreement says the tenant must pay for ALL repairs:

You may suggest asking for a clearer distinction between:

- tenant-caused damage
- normal wear and tear
- structural repairs
- major building repairs

The suggestion should explain why clarity can prevent disputes.

Example 3:

If the agreement gives only the landlord a termination right:

Suggest asking for a corresponding tenant termination option
or clearer notice terms.

Do not claim that the tenant automatically has that legal right
unless the supplied legal reference establishes it.

Example 4:

If the agreement has a vague penalty:

Suggest asking for the exact amount, trigger, and maximum exposure
to be written clearly.

============================================================
BAD NEGOTIATION BEHAVIOR
============================================================

Do NOT:

- invent problems
- invent legal rights
- invent amounts
- invent deadlines
- call normal terms unfair without reason
- recommend negotiating every clause
- repeat the same suggestion
- give generic advice unrelated to this agreement
- state that a negotiation request is legally mandatory
- manufacture a suggestion simply to fill the output

============================================================
VERIFIED LEGAL CHECK
============================================================

For every relevant legal reference:

1. Determine whether the agreement contains a related clause.

2. If not, do not automatically call the absence a violation.

3. If yes, compare the wording with the supplied reference.

4. Use the correct status.

5. Include the exact supplied reference.

6. Use the exact supplied official source name.

7. Use the exact supplied official source URL.

8. Never fabricate a source URL.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Do not use markdown.

Use exactly this structure:

{{
  "extracted_text": "The text/content of the agreement",

  "overall_risk": "Low | Medium | High",

  "summary": "Simple summary of the agreement",

  "financial_obligations": [
    {{
      "title": "Short title",
      "amount": "Amount or relevant value",
      "explanation": "Simple explanation"
    }}
  ],

  "deadlines": [
    {{
      "title": "Short title",
      "deadline": "Date or time period",
      "explanation": "Simple explanation"
    }}
  ],

  "risks": [
    {{
      "title": "Short title",
      "severity": "Low | Medium | High",
      "explanation": "Simple explanation",
      "agreement_text": "Relevant agreement wording"
    }}
  ],

  "important_clauses": [
    {{
      "title": "Short title",
      "explanation": "Simple explanation",
      "agreement_text": "Relevant agreement wording"
    }}
  ],

  "legal_findings": [
    {{
      "title": "Short title",
      "status": "Attention | Potentially inconsistent | Generally consistent | Not enough information",
      "severity": "Low | Medium | High",
      "explanation": "Simple explanation",
      "agreement_text": "Relevant wording if available",
      "legal_reference": "Exact supplied reference",
      "source": "Exact supplied official source name",
      "source_url": "Exact supplied official source URL"
    }}
  ],

  "negotiation_suggestions": [
    {{
      "title": "Short issue name",
      "priority": "Low | Medium | High",
      "current_term": "What the agreement actually says",
      "suggestion": "Specific change or clarification the tenant could request",
      "reason": "Practical reason this could help the tenant"
    }}
  ]
}}

============================================================
FINAL QUALITY CHECK
============================================================

Before returning the JSON, verify:

- Every amount came from the agreement.
- Every date came from the agreement.
- Every agreement quote came from the agreement.
- Every legal source came from the supplied references.
- Every negotiation suggestion is supported by an actual agreement term.
- No negotiation suggestion is presented as legal advice.
- No duplicate negotiation suggestions exist.
- No unnecessary negotiation suggestions were added.
- 0–5 negotiation suggestions only.
- High priority is reserved for genuinely important issues.
- If there is nothing meaningful to negotiate, return [].

Never claim that SamjhoSign has provided legal advice.
Never claim that SamjhoSign determined legal enforceability.

Do not add markdown fences.
Do not add explanations outside the JSON.
"""


# ============================================================
# JSON CLEANING
# ============================================================

def clean_json_response(text: str) -> str:
    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


# ============================================================
# NORMALIZE COMPLETE ANALYSIS
# ============================================================

def normalize_analysis(
    data: dict,
    extracted_text: str,
) -> dict:

    legal_findings = normalize_legal_findings(
        data.get(
            "legal_findings",
            []
        )
    )

    negotiation_suggestions = (
        normalize_negotiation_suggestions(
            data.get(
                "negotiation_suggestions",
                []
            )
        )
    )

    return {
        "extracted_text": data.get(
            "extracted_text",
            extracted_text,
        ),

        "overall_risk": data.get(
            "overall_risk",
            "Medium",
        ),

        "summary": data.get(
            "summary",
            "",
        ),

        "financial_obligations": data.get(
            "financial_obligations",
            [],
        ),

        "deadlines": data.get(
            "deadlines",
            [],
        ),

        "risks": data.get(
            "risks",
            [],
        ),

        "important_clauses": data.get(
            "important_clauses",
            [],
        ),

        "legal_findings": legal_findings,

        "negotiation_suggestions":
            negotiation_suggestions,
    }


# ============================================================
# GEMINI ANALYSIS
# ============================================================

def analyze_with_gemini(
    pdf_bytes: bytes,
    extracted_text: str,
) -> dict:

    last_error = None

    pdf_part = types.Part.from_bytes(
        data=pdf_bytes,
        mime_type="application/pdf",
    )

    for model_name in MODEL_NAMES:

        print(
            f"Trying Gemini model: {model_name}"
        )

        try:

            response = client.models.generate_content(
                model=model_name,

                contents=[
                    pdf_part,
                    ANALYSIS_PROMPT,
                ],

                config=types.GenerateContentConfig(
                    temperature=0.15,
                    response_mime_type="application/json",
                ),
            )

            if not response.text:
                raise RuntimeError(
                    f"{model_name} returned an empty response"
                )

            cleaned = clean_json_response(
                response.text
            )

            data = json.loads(cleaned)

            return normalize_analysis(
                data,
                extracted_text,
            )

        except Exception as error:

            last_error = error

            error_text = str(error)

            print(
                f"Gemini error with {model_name}: "
                f"{error_text}"
            )

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

            model_unavailable = any(
                code in error_text
                for code in [
                    "404",
                    "NOT_FOUND",
                    "not available",
                    "no longer available",
                ]
            )

            if (
                transient_error
                or model_unavailable
            ):
                time.sleep(2)
                continue

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
    file: UploadFile = File(...),
):

    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )

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

        print(
            f"File read error: {error}"
        )

        return JSONResponse(
            status_code=200,
            content={
                "error": (
                    "Could not read the uploaded file."
                )
            },
        )

    # --------------------------------------------------------
    # SIZE
    # --------------------------------------------------------

    if len(pdf_bytes) > MAX_FILE_SIZE:

        return JSONResponse(
            status_code=200,
            content={
                "error": (
                    "PDF must be smaller than 10 MB."
                )
            },
        )

    if len(pdf_bytes) == 0:

        return JSONResponse(
            status_code=200,
            content={
                "error": (
                    "The uploaded PDF is empty."
                )
            },
        )

    # --------------------------------------------------------
    # PDF PARSING
    # --------------------------------------------------------

    pages = 0
    extracted_text = ""

    try:

        reader = PdfReader(
            BytesIO(pdf_bytes)
        )

        pages = len(reader.pages)

        text_parts = []

        for page in reader.pages:

            try:

                page_text = page.extract_text()

                if page_text:
                    text_parts.append(
                        page_text
                    )

            except Exception:
                continue

        extracted_text = (
            "\n\n".join(
                text_parts
            ).strip()
        )

    except Exception as error:

        print(
            f"PDF parsing error: {error}"
        )

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
                extracted_text,
            ),

            "analysis": {

                "overall_risk": analysis.get(
                    "overall_risk",
                    "Medium",
                ),

                "summary": analysis.get(
                    "summary",
                    "",
                ),

                "financial_obligations":
                    analysis.get(
                        "financial_obligations",
                        [],
                    ),

                "deadlines":
                    analysis.get(
                        "deadlines",
                        [],
                    ),

                "risks":
                    analysis.get(
                        "risks",
                        [],
                    ),

                "important_clauses":
                    analysis.get(
                        "important_clauses",
                        [],
                    ),

                "legal_findings":
                    analysis.get(
                        "legal_findings",
                        [],
                    ),

                "negotiation_suggestions":
                    analysis.get(
                        "negotiation_suggestions",
                        [],
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