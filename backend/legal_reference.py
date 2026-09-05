"""
Verified Tamil Nadu tenancy legal references for SamjhoSign.

Primary sources:
- Tamil Nadu Regulation of Rights and Responsibilities of Landlords
  and Tenants Act, 2017 (Tamil Nadu Act 42 of 2017)
- Tamil Nadu Regulation of Rights and Responsibilities of Landlords
  and Tenants Rules, 2019
- Tamil Nadu Government official tenancy portal FAQ
- Tamil Nadu Act 19 of 2022 (Amendment Act)

IMPORTANT:
This file is a reference layer for document analysis.
It is NOT a substitute for legal advice.
The model must not automatically label a contractual clause "illegal"
unless the source clearly supports that conclusion.
"""

LEGAL_REFERENCE_VERSION = "TN-TENANCY-2026-09"


# ============================================================
# VERIFIED OFFICIAL SOURCES
# ============================================================

LEGAL_SOURCES = {
    "act_2017": {
        "title": (
            "Tamil Nadu Regulation of Rights and Responsibilities "
            "of Landlords and Tenants Act, 2017"
        ),
        "citation": "Tamil Nadu Act 42 of 2017",
        "url": (
            "https://www.tenancy.tn.gov.in/"
            "Content/Documents/TNRRRLTact2017.pdf"
        ),
    },

    "rules_2019": {
        "title": (
            "Tamil Nadu Regulation of Rights and Responsibilities "
            "of Landlords and Tenants Rules, 2019"
        ),
        "citation": "Tamil Nadu Rules, 2019",
        "url": (
            "https://www.tenancy.tn.gov.in/"
            "Content/Documents/79Act.pdf"
        ),
    },

    "official_faq": {
        "title": "Tamil Nadu Tenancy Official FAQ",
        "citation": "Government of Tamil Nadu Tenancy Portal",
        "url": (
            "https://www.tenancy.tn.gov.in/Home/FAQ"
        ),
    },

    "official_portal": {
        "title": "Tamil Nadu Tenancy Registration Portal",
        "citation": "Government of Tamil Nadu",
        "url": (
            "https://www.tenancy.tn.gov.in/"
        ),
    },

    "amendment_2022": {
        "title": (
            "Tamil Nadu Regulation of Rights and Responsibilities "
            "of Landlords and Tenants (Amendment) Act, 2022"
        ),
        "citation": "Tamil Nadu Act 19 of 2022",
        "url": (
            "https://www.indiacode.nic.in/bitstream/"
            "123456789/20507/1/2017tn42.pdf"
        ),
    },
}


# ============================================================
# TAMIL NADU LEGAL REFERENCES
# ============================================================

TN_LEGAL_REFERENCES = [
    {
        "id": "tn_registration_written_agreement",
        "topic": "registration",
        "title": "Written tenancy agreement and Rent Authority registration",
        "source": "act_2017",
        "section": "Section 4",
        "rule": "Rule 3",
        "keywords": [
            "written agreement",
            "registration",
            "rent authority",
            "registered",
            "tenancy agreement",
            "registration number",
            "TR number",
        ],
        "reference": (
            "After commencement of the Act, letting or taking premises on "
            "rent is to be through an agreement in writing. The tenancy "
            "agreement is to be informed to the Rent Authority, which "
            "registers the agreement and provides a registration number."
        ),
        "analysis_instruction": (
            "Check whether the agreement appears to be a written tenancy "
            "agreement and whether it contains indications of Rent Authority "
            "registration. Do not assume that absence of a registration "
            "number proves non-registration unless the document is intended "
            "to contain that information."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_registration_90_days",
        "topic": "registration",
        "title": "Registration timeline",
        "source": "rules_2019",
        "section": "Section 4",
        "rule": "Rule 3(2)",
        "keywords": [
            "90 days",
            "ninety days",
            "registration within 90 days",
            "rent authority registration",
        ],
        "reference": (
            "Rule 3 provides that tenancy agreements entered into after "
            "commencement of the Act are to be registered with the Rent "
            "Authority within ninety days from the date of execution."
        ),
        "analysis_instruction": (
            "If the agreement provides an execution date, calculate or "
            "identify the 90-day registration deadline where useful. "
            "Flag missing registration information as an attention item, "
            "not automatically as proof of non-compliance."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_registration_independent",
        "topic": "registration",
        "title": (
            "Rent Authority registration is separate from "
            "Sub-Registrar registration"
        ),
        "source": "official_faq",
        "section": "Section 4 / FAQ",
        "rule": "Official FAQ",
        "keywords": [
            "sub registrar",
            "sub-registrar",
            "registration act",
            "rent authority",
            "both registrations",
        ],
        "reference": (
            "The official Tamil Nadu tenancy FAQ states that registration "
            "with the Rent Authority is independent of registration under "
            "the Registration Act, 1908."
        ),
        "analysis_instruction": (
            "If an agreement says that Sub-Registrar registration alone "
            "satisfies the Tamil Nadu tenancy registration requirement, "
            "identify this for attention."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_security_deposit",
        "topic": "security_deposit",
        "title": "Security deposit",
        "source": "act_2017",
        "section": "Section 11",
        "rule": None,
        "keywords": [
            "security deposit",
            "deposit",
            "advance deposit",
            "refundable deposit",
            "three times",
            "3 times",
        ],
        "reference": (
            "Section 11 states that, save an agreement to the contrary, "
            "it is unlawful to charge a security deposit in excess of "
            "three times the monthly rent. It also states that the security "
            "deposit is to be refunded within one month after vacation, "
            "subject to due deductions for tenant liability."
        ),
        "analysis_instruction": (
            "Extract monthly rent and security deposit where possible. "
            "Compare the deposit with three times monthly rent. Because "
            "Section 11 contains the words 'save an agreement to the "
            "contrary', do not automatically declare a deposit above "
            "three months illegal; instead describe the apparent issue "
            "and recommend verification."
        ),
        "severity_if_missing": "High",
    },

    {
        "id": "tn_rent_revision",
        "topic": "rent",
        "title": "Revision of rent",
        "source": "act_2017",
        "section": "Section 9",
        "rule": None,
        "keywords": [
            "rent increase",
            "rent revision",
            "increase in rent",
            "rent escalation",
            "rent escalation clause",
            "rent hike",
        ],
        "reference": (
            "Section 9 provides that revision of rent between landlord and "
            "tenant is according to the terms set out in the tenancy "
            "agreement. Save as agreed in the agreement, the landlord is "
            "to give written notice three months before revised rent "
            "becomes due. For a fixed term, rent may not be increased "
            "during the tenancy unless the increase or method of calculation "
            "is expressly set out in the tenancy agreement."
        ),
        "analysis_instruction": (
            "Identify rent-escalation clauses, the percentage or amount "
            "of increase, the effective date, and the notice period. "
            "For fixed-term agreements, pay particular attention to whether "
            "the agreement expressly provides the increase or calculation."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_rent_receipt",
        "topic": "rent_payment",
        "title": "Receipt for rent paid",
        "source": "act_2017",
        "section": "Section 13",
        "rule": None,
        "keywords": [
            "rent receipt",
            "receipt",
            "acknowledgement",
            "rent payment",
            "payment receipt",
        ],
        "reference": (
            "Section 13 provides that a tenant who makes payment of rent "
            "or other charges is entitled, against acknowledgement, to "
            "obtain a written receipt from the landlord or property manager."
        ),
        "analysis_instruction": (
            "Check whether the agreement contains a payment-record or "
            "receipt mechanism. Do not treat the absence of a receipt "
            "clause alone as proof that the statutory right does not exist."
        ),
        "severity_if_missing": "Low",
    },

    {
        "id": "tn_default_interest",
        "topic": "late_payment",
        "title": "Interest on arrears of rent",
        "source": "rules_2019",
        "section": "Section 21 / Rule 7",
        "rule": "Rule 7(1)",
        "keywords": [
            "late payment",
            "interest",
            "arrears",
            "delayed rent",
            "default interest",
            "8%",
            "8 percent",
        ],
        "reference": (
            "Rule 7 provides that, save as otherwise provided in the "
            "tenancy agreement, interest payable by the tenant to the "
            "landlord on arrears of rent and other charges is 8 percent "
            "per annum."
        ),
        "analysis_instruction": (
            "Identify any late-payment interest rate in the agreement. "
            "Compare it with the prescribed default rate of 8 percent "
            "per annum and explain that the rule itself allows the "
            "tenancy agreement to provide otherwise."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_repairs_maintenance",
        "topic": "repairs",
        "title": "Repair and maintenance responsibilities",
        "source": "act_2017",
        "section": "Section 15",
        "rule": "Second Schedule",
        "keywords": [
            "repair",
            "maintenance",
            "plumbing",
            "electrical",
            "structural repair",
            "common facilities",
            "maintenance responsibility",
            "repair cost",
        ],
        "reference": (
            "Section 15 requires landlord and tenant to keep the premises "
            "in the condition applicable under the Act, subject to normal "
            "wear and tear, with respective repair and maintenance "
            "responsibilities specified in the Second Schedule. "
            "Responsibilities for shared common facilities are to be "
            "specified in the tenancy agreement."
        ),
        "analysis_instruction": (
            "Extract repair and maintenance obligations and identify "
            "which party pays for which category of repair. Highlight "
            "clauses that place broad or unclear repair obligations on "
            "one party."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_uninhabitable_repairs",
        "topic": "repairs",
        "title": "Uninhabitable premises and landlord refusal to repair",
        "source": "act_2017",
        "section": "Section 15(5)",
        "rule": None,
        "keywords": [
            "uninhabitable",
            "unfit for habitation",
            "repairs refused",
            "abandon",
            "15 days notice",
        ],
        "reference": (
            "Section 15(5) addresses premises that are uninhabitable "
            "without required repairs where the landlord refuses to "
            "carry them out after written notice. It provides for the "
            "tenant's right to abandon the premises after giving fifteen "
            "days' written notice or by approaching the Rent Authority."
        ),
        "analysis_instruction": (
            "If the agreement contains clauses concerning habitability, "
            "major repairs, or abandonment because of serious defects, "
            "surface the relevant statutory reference."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_landlord_entry",
        "topic": "landlord_entry",
        "title": "Landlord entry and inspection",
        "source": "act_2017",
        "section": "Section 17",
        "rule": None,
        "keywords": [
            "entry",
            "inspection",
            "landlord entry",
            "property inspection",
            "24 hours",
            "twenty four hours",
            "notice before entry",
        ],
        "reference": (
            "Section 17 provides for entry by the landlord or property "
            "manager after written notice of at least twenty-four hours "
            "for specified purposes. The notice is to state the reason "
            "and the entry time is between 7:00 A.M. and 8:00 P.M."
        ),
        "analysis_instruction": (
            "Identify clauses allowing landlord/property-manager entry. "
            "Check whether the clause specifies advance notice, purpose, "
            "and reasonable entry hours. Flag unusually broad access rights."
        ),
        "severity_if_missing": "High",
    },

    {
        "id": "tn_essential_services",
        "topic": "essential_services",
        "title": "Essential supplies and services",
        "source": "act_2017",
        "section": "Section 20",
        "rule": None,
        "keywords": [
            "water",
            "electricity",
            "essential service",
            "essential services",
            "power",
            "lift",
            "parking",
            "sanitary services",
            "cut off",
            "withhold",
        ],
        "reference": (
            "Section 20 states that a landlord or tenant shall not cut "
            "off or withhold an essential supply or service. The Act's "
            "explanation includes water, electricity, lights in passages, "
            "lifts and staircases, conservancy, parking, communication "
            "links and sanitary services."
        ),
        "analysis_instruction": (
            "Identify clauses allowing essential services to be stopped "
            "because of rent disputes or other disagreements. Flag such "
            "clauses for legal attention."
        ),
        "severity_if_missing": "High",
    },

    {
        "id": "tn_subletting_2022",
        "topic": "subletting",
        "title": "Sub-letting and assignment",
        "source": "amendment_2022",
        "section": "Section 7 as substituted by Act 19 of 2022",
        "rule": None,
        "keywords": [
            "sublet",
            "sub-let",
            "sub lease",
            "sublease",
            "assignment",
            "assign rights",
            "supplementary agreement",
        ],
        "reference": (
            "The 2022 amendment substituted Section 7. It provides that "
            "after commencement of the Act, a tenant shall not sub-let "
            "whole or part of the premises or transfer/assign tenancy "
            "rights except by entering into a supplementary agreement "
            "to the existing tenancy agreement. The landlord and tenant "
            "are to jointly inform the Rent Authority about the sub-tenancy "
            "within two months from execution of that supplementary agreement."
        ),
        "analysis_instruction": (
            "Identify whether the agreement permits, prohibits, or "
            "conditions subletting or assignment. If subletting is permitted, "
            "check whether the agreement addresses the supplementary "
            "agreement and Rent Authority information requirements."
        ),
        "severity_if_missing": "High",
    },

    {
        "id": "tn_termination_reporting",
        "topic": "termination",
        "title": "Reporting expiry or earlier termination",
        "source": "rules_2019",
        "section": "Rule 5",
        "rule": "Rule 5(1)",
        "keywords": [
            "termination",
            "expiry",
            "termination notice",
            "end of tenancy",
            "vacating",
            "vacate",
            "15 days",
            "fifteen days",
        ],
        "reference": (
            "Rule 5 states that on expiry or earlier termination of a "
            "tenancy, the parties shall inform the Rent Authority in "
            "the prescribed form within fifteen days from the date of "
            "expiry or termination."
        ),
        "analysis_instruction": (
            "If the agreement contains termination procedures, explain "
            "the separate Rent Authority reporting requirement. Do not "
            "confuse this statutory reporting timeline with the contractual "
            "notice period for termination."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_original_agreement",
        "topic": "documentation",
        "title": (
            "Tenant should receive original signed and registered agreement"
        ),
        "source": "act_2017",
        "section": "Section 12",
        "rule": None,
        "keywords": [
            "original agreement",
            "signed copy",
            "registered copy",
            "copy of agreement",
            "tenant copy",
        ],
        "reference": (
            "Section 12 provides that after the tenancy agreement is "
            "signed, the landlord shall give one original signed and "
            "registered agreement to the tenant within fifteen days."
        ),
        "analysis_instruction": (
            "Check whether the agreement/document package contains "
            "language concerning delivery of the tenant's signed "
            "and registered copy."
        ),
        "severity_if_missing": "Low",
    },

    {
        "id": "tn_fixed_term",
        "topic": "tenancy_period",
        "title": "Fixed tenancy period and renewal",
        "source": "act_2017",
        "section": "Section 5",
        "rule": None,
        "keywords": [
            "fixed term",
            "tenancy period",
            "lease period",
            "term",
            "renewal",
            "extension",
            "month to month",
        ],
        "reference": (
            "Section 5 provides that tenancies entered into after "
            "commencement are for the period agreed by landlord and tenant "
            "and specified in the tenancy agreement. A fixed-term tenancy "
            "that ends without renewal or vacation is addressed by "
            "Section 5(3), which provides for deemed month-to-month renewal "
            "on the same terms for a maximum period of six months."
        ),
        "analysis_instruction": (
            "Extract the tenancy start date, end date, renewal mechanism, "
            "and any automatic-renewal language. Flag unclear or conflicting "
            "term provisions."
        ),
        "severity_if_missing": "Medium",
    },

    {
        "id": "tn_non_registration_consequence",
        "topic": "registration",
        "title": "Potential consequences of non-registration",
        "source": "official_faq",
        "section": "Section 4-A",
        "rule": "Official FAQ",
        "keywords": [
            "unregistered",
            "non registration",
            "non-registration",
            "registration consequence",
            "evidence",
        ],
        "reference": (
            "The official Tamil Nadu tenancy FAQ explains that under "
            "Section 4-A, where a tenancy agreement is not registered "
            "with the Rent Authority, the agreement shall not affect "
            "immovable property comprised therein or confer specified "
            "rights/powers and shall not be received as evidence of "
            "certain transactions affecting that property or conferring rights."
        ),
        "analysis_instruction": (
            "If the agreement contains language suggesting registration "
            "is optional, identify the issue and cite Section 4-A. "
            "Do not predict litigation outcomes."
        ),
        "severity_if_missing": "High",
    },

    {
        "id": "tn_stamp_duty",
        "topic": "stamp_duty",
        "title": "Stamp duty reference for tenancy agreements",
        "source": "official_faq",
        "section": (
            "Article 35 of the Indian Stamp Act as referenced by TN FAQ"
        ),
        "rule": None,
        "keywords": [
            "stamp duty",
            "stamp",
            "stamp paper",
            "duty",
            "aggregate rent",
            "premium",
            "advance",
        ],
        "reference": (
            "The official Tamil Nadu tenancy FAQ states that tenancy "
            "agreements are to be stamped under Article 35 of the Indian "
            "Stamp Act as applicable in Tamil Nadu. The FAQ gives different "
            "rates based on the period of tenancy and the amount of rent, "
            "fine, premium or advance payable."
        ),
        "analysis_instruction": (
            "Identify whether the agreement contains stamp-duty or "
            "execution information. Do not calculate a final stamp-duty "
            "amount unless the required facts are available and the "
            "applicable current schedule has been verified."
        ),
        "severity_if_missing": "Medium",
    },
]


# ============================================================
# INTERNAL SOURCE ENRICHMENT
# ============================================================

def _enrich_reference(reference):
    """
    Add verified source title, citation and URL to each reference.

    The model-facing reference keeps the source ID, while the backend
    can use the enriched fields to return the actual official source.
    """

    source_id = reference.get("source")

    source_details = LEGAL_SOURCES.get(
        source_id,
        {},
    )

    enriched = dict(reference)

    enriched["source_name"] = source_details.get(
        "title",
        source_id or "",
    )

    enriched["source_citation"] = source_details.get(
        "citation",
        "",
    )

    enriched["source_url"] = source_details.get(
        "url",
        "",
    )

    return enriched


# ============================================================
# PUBLIC REFERENCE HELPERS
# ============================================================

def get_references_for_topics(topics):
    """
    Return references relevant to a list of topics.

    Example:
        get_references_for_topics(
            ["registration", "security_deposit"]
        )
    """

    normalized_topics = {
        str(topic).strip().lower()
        for topic in topics
        if topic
    }

    if not normalized_topics:
        return [
            _enrich_reference(reference)
            for reference in TN_LEGAL_REFERENCES
        ]

    matched = [
        _enrich_reference(reference)
        for reference in TN_LEGAL_REFERENCES
        if reference["topic"].lower() in normalized_topics
    ]

    return matched


def get_all_references():
    """
    Return the complete verified reference list with
    official source metadata.
    """

    return [
        _enrich_reference(reference)
        for reference in TN_LEGAL_REFERENCES
    ]


# ============================================================
# GEMINI FORMATTER
# ============================================================

def format_references_for_gemini(references=None):
    """
    Convert references into compact text suitable for a Gemini prompt.

    The actual official source title and URL are explicitly supplied
    so Gemini can return them without inventing them.
    """

    if references is None:
        references = get_all_references()
    else:
        references = [
            _enrich_reference(reference)
            for reference in references
        ]

    lines = [
        "VERIFIED TAMIL NADU TENANCY LEGAL REFERENCES",
        f"Reference version: {LEGAL_REFERENCE_VERSION}",
        "",
        "Use these references only when relevant to the uploaded agreement.",
        "Do not invent sections, rules, deadlines, or legal conclusions.",
        "Do not automatically call a clause 'illegal' unless the source "
        "clearly supports that conclusion.",
        "",
        "IMPORTANT SOURCE RULE:",
        "For every legal finding, use the exact source name and exact "
        "official source URL supplied below.",
        "Never invent or substitute a URL.",
        "",
    ]

    for index, reference in enumerate(
        references,
        start=1,
    ):

        lines.append(
            f"{index}. {reference['title']}"
        )

        lines.append(
            f"Topic: {reference['topic']}"
        )

        lines.append(
            f"Section: {reference['section']}"
        )

        if reference.get("rule"):
            lines.append(
                f"Rule: {reference['rule']}"
            )

        lines.append(
            f"Reference: {reference['reference']}"
        )

        lines.append(
            f"Analysis instruction: "
            f"{reference['analysis_instruction']}"
        )

        lines.append(
            f"Official source name: "
            f"{reference['source_name']}"
        )

        lines.append(
            f"Official source citation: "
            f"{reference['source_citation']}"
        )

        lines.append(
            f"Official source URL: "
            f"{reference['source_url']}"
        )

        lines.append("")

    return "\n".join(lines)