from app.schemas import IncidentResponse, AIAnalysis
from app.resources import get_available_units_by_capability


def orchestrate_decision(analysis: AIAnalysis) -> IncidentResponse:
    """
    Pure orchestration logic:
    - Maps emergency type → capability
    - Selects best available unit
    - Returns IncidentResponse
    """

    # 1️⃣ Map emergency type → required capability
    if analysis.emergency_type == "Flood":
        capability = "RESCUE_BOAT"
    elif analysis.emergency_type == "Fire":
        capability = "FIRE_ENGINE"
    else:
        capability = "AMBULANCE"

    # 2️⃣ Fetch available units
    units = get_available_units_by_capability(capability)

    if not units:
        suggested = "No suitable units available"
    else:
        best = min(units, key=lambda x: x["eta_minutes"])
        suggested = f"{best['unit_id']} ({best['eta_minutes']} mins ETA)"

    # 3️⃣ Return internal response
    return IncidentResponse(
        analysis=analysis,
        suggested_unit=suggested
    )
