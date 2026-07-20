from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.telegram_notifier import send_telegram_alert
from app.schemas import (
    TranscriptInput,
    FrontendResponse,
    UnitState,
    StatusUpdate,
    ReallocateRequest,
)
from app.ai_engine import analyze_transcript
from app.orchestrator import orchestrate_decision
from app import unit_state

app = FastAPI(title="ResQ-Connect AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze", response_model=FrontendResponse)
async def process_call(input_data: TranscriptInput):
    analysis = analyze_transcript(input_data.text)
    incident = orchestrate_decision(analysis)
    try:
        send_telegram_alert(incident)
    except Exception as e:
        # Never break API response due to Telegram
        print("⚠️ Telegram notification failed:", e)

    return FrontendResponse(
        incident_id=incident.incident_id,
        emergency_type=incident.analysis.emergency_type,
        severity=incident.analysis.severity,
        location=incident.analysis.location,
        reasoning=incident.analysis.reasoning,
        confidence_score=incident.analysis.confidence_score,
        suggested_unit=incident.suggested_unit,
        keywords=incident.analysis.keywords,
        reallocation=incident.reallocation,
    )


# ---------------------------------------------------------------------------
# Live unit tracking + reallocation
# ---------------------------------------------------------------------------

@app.get("/units", response_model=List[UnitState])
async def list_units():
    """Return the live state of every unit (polled by the tactical map)."""
    return unit_state.get_all_units()


@app.post("/units/{unit_id}/status", response_model=UnitState)
async def set_unit_status(unit_id: str, payload: StatusUpdate):
    """Advance a unit through its lifecycle (EN_ROUTE -> ON_SCENE -> ... )."""
    try:
        updated = unit_state.update_status(unit_id, payload.status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    return updated


@app.post("/units/reallocate", response_model=UnitState)
async def reallocate_unit(payload: ReallocateRequest):
    """Confirm an operator-approved reallocation: pull the unit onto the new incident."""
    updated = unit_state.assign_unit(
        payload.unit_id,
        payload.incident_id,
        payload.severity,
        status="EN_ROUTE",
    )
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Unit '{payload.unit_id}' not found")
    return updated


@app.post("/units/reset", response_model=List[UnitState])
async def reset_units():
    """Reload the roster from disk, discarding live mutations (demo helper)."""
    return unit_state.reset_units()
