import uuid

from app.schemas import IncidentResponse, AIAnalysis, ReallocationSuggestion
from app import unit_state


# Emergency type -> required vehicle capability
_CAPABILITY_MAP = {
    "Flood": "RESCUE_BOAT",
    "Fire": "FIRE_ENGINE",
}
_DEFAULT_CAPABILITY = "AMBULANCE"


def _map_capability(emergency_type: str) -> str:
    return _CAPABILITY_MAP.get(emergency_type, _DEFAULT_CAPABILITY)


def orchestrate_decision(analysis: AIAnalysis) -> IncidentResponse:
    """
    Orchestration logic with live state + auto-reallocation:
      1. Map emergency type -> capability
      2. If an AVAILABLE unit exists, dispatch the nearest one (EN_ROUTE)
      3. Otherwise, if this incident out-prioritizes a busy unit's current job,
         propose reallocating that unit (operator must confirm)
      4. Return IncidentResponse with the suggestion + optional reallocation
    """
    incident_id = f"RESQ-{uuid.uuid4().hex[:4].upper()}"
    capability = _map_capability(analysis.emergency_type)

    available = unit_state.get_available_units_by_capability(capability)
    reallocation = None

    if available:
        # Dispatch the nearest available unit and commit it immediately.
        best = min(available, key=lambda u: u["eta_minutes"])
        unit_state.assign_unit(
            best["unit_id"], incident_id, analysis.severity, status="EN_ROUTE"
        )
        suggested = f"{best['unit_id']} ({best['eta_minutes']} mins ETA)"
    else:
        # No free unit: can we pull one off a lower-priority job?
        incoming_priority = unit_state.severity_rank(analysis.severity)
        busy = unit_state.get_busy_units_by_capability(capability)
        candidates = [
            u for u in busy
            if unit_state.severity_rank(u.get("assigned_severity")) < incoming_priority
        ]

        if candidates:
            # Prefer pulling the lowest-priority job, then the fastest ETA.
            candidates.sort(
                key=lambda u: (
                    unit_state.severity_rank(u.get("assigned_severity")),
                    u["eta_minutes"],
                )
            )
            cand = candidates[0]
            reallocation = ReallocationSuggestion(
                unit_id=cand["unit_id"],
                from_incident=cand.get("assigned_incident"),
                from_severity=cand.get("assigned_severity"),
                to_severity=analysis.severity,
                eta_minutes=cand["eta_minutes"],
                message=(
                    f"No {capability.replace('_', ' ').title()} available. "
                    f"{cand['unit_id']} is on a {cand.get('assigned_severity') or 'lower'}-priority "
                    f"job and can be reallocated to this {analysis.severity} incident "
                    f"({cand['eta_minutes']} mins ETA)."
                ),
            )
            suggested = f"{cand['unit_id']} (reallocation required)"
        else:
            suggested = "No suitable units available"

    return IncidentResponse(
        incident_id=incident_id,
        analysis=analysis,
        suggested_unit=suggested,
        reallocation=reallocation,
    )
