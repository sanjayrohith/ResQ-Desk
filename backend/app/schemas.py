import re
import uuid
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

# Max character length for transcript input
MAX_TRANSCRIPT_LENGTH = 5000

# Patterns that suggest prompt injection attempts
_INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|all)\s+(instructions|prompts|rules)",
    r"you\s+are\s+now\s+a",
    r"system\s*:\s*",
    r"<\s*(system|prompt|instruction)",
    r"forget\s+(everything|your\s+instructions)",
    r"override\s+(your|the)\s+(instructions|rules|prompt)",
]
_INJECTION_RE = re.compile("|".join(_INJECTION_PATTERNS), re.IGNORECASE)


class TranscriptInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TRANSCRIPT_LENGTH)

    @field_validator("text")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        # Strip leading/trailing whitespace
        v = v.strip()

        # Remove null bytes and non-printable control characters (keep newlines/tabs)
        v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v)

        # Check for prompt injection patterns
        if _INJECTION_RE.search(v):
            raise ValueError("Input contains disallowed patterns")

        return v

class AIAnalysis(BaseModel):
    emergency_type: str
    severity: str
    location: str
    keywords: List[str]
    reasoning: str
    confidence_score: float

class ReallocationSuggestion(BaseModel):
    """A proposal to pull a busy unit off a lower-priority incident.

    Emitted when no AVAILABLE unit of the required capability exists but a higher
    priority incident justifies reassigning one that is already committed.
    """
    unit_id: str
    from_incident: Optional[str] = None
    from_severity: Optional[str] = None
    to_severity: Optional[str] = None
    eta_minutes: Optional[int] = None
    message: str


class IncidentResponse(BaseModel):
    incident_id: str = Field(default_factory=lambda: f"RESQ-{uuid.uuid4().hex[:4].upper()}")
    analysis: AIAnalysis
    suggested_unit: Optional[str] = None
    reallocation: Optional[ReallocationSuggestion] = None


class FrontendResponse(BaseModel):
    incident_id: str
    emergency_type: str
    severity: str
    location: str
    reasoning: str
    confidence_score: float
    suggested_unit: Optional[str]
    keywords: List[str] = []
    reallocation: Optional[ReallocationSuggestion] = None


# ---------------------------------------------------------------------------
# Live unit tracking models
# ---------------------------------------------------------------------------

class UnitState(BaseModel):
    unit_id: str
    vehicle_type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None
    status: str
    assigned_incident: Optional[str] = None
    assigned_severity: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str = Field(..., description="AVAILABLE | EN_ROUTE | ON_SCENE | RETURNING")


class ReallocateRequest(BaseModel):
    unit_id: str
    incident_id: str
    severity: Optional[str] = None