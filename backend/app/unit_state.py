"""
In-memory live unit state store.

ResQ-Desk has no database, so this module holds the mutable, live state of every
emergency unit for the lifetime of the process. It loads the seed roster from
`data/units.json` once, then serves and mutates that state in-memory.

Unit lifecycle:
    AVAILABLE  -> idle, can be dispatched
    EN_ROUTE   -> assigned and travelling to an incident
    ON_SCENE   -> arrived and working the incident
    RETURNING  -> job done, heading back to base (still not dispatchable)

Reallocation:
    When no AVAILABLE unit of the required capability exists, a busy unit that is
    currently serving a *lower-priority* incident may be pulled onto a
    higher-priority one. Severity ranking drives that decision.
"""

import json
import threading
from pathlib import Path
from typing import Dict, List, Optional

# Resolve units.json relative to this file so it works regardless of CWD.
_UNITS_PATH = Path(__file__).resolve().parent.parent / "data" / "units.json"

# Statuses that mean a unit is actively committed to an incident.
BUSY_STATUSES = ("EN_ROUTE", "ON_SCENE", "RETURNING")
VALID_STATUSES = ("AVAILABLE",) + BUSY_STATUSES

# Higher number = higher priority. Unknown severities fall back to Normal.
SEVERITY_RANK = {"critical": 3, "high": 2, "normal": 1, "low": 0}

_lock = threading.RLock()
_units: List[Dict] = []
_loaded = False


def severity_rank(severity: Optional[str]) -> int:
    """Map a severity label to a comparable integer priority."""
    if not severity:
        return 0
    return SEVERITY_RANK.get(severity.strip().lower(), 1)


def _load(force: bool = False) -> None:
    """Load the roster from disk into memory (once, unless forced)."""
    global _units, _loaded
    with _lock:
        if _loaded and not force:
            return
        try:
            with open(_UNITS_PATH, "r") as f:
                data = json.load(f)
        except Exception:
            data = []

        for u in data:
            u.setdefault("status", "AVAILABLE")
            u.setdefault("assigned_incident", None)
            u.setdefault("assigned_severity", None)

        _units = data
        _loaded = True


def _find(unit_id: str) -> Optional[Dict]:
    """Return the live dict for a unit (caller must hold the lock)."""
    for u in _units:
        if u["unit_id"] == unit_id:
            return u
    return None


def get_all_units() -> List[Dict]:
    """Return copies of every unit's current live state."""
    _load()
    with _lock:
        return [dict(u) for u in _units]


def get_available_units_by_capability(capability: str) -> List[Dict]:
    """Return AVAILABLE units matching the requested vehicle capability."""
    _load()
    with _lock:
        return [
            dict(u)
            for u in _units
            if u["status"] == "AVAILABLE" and u["vehicle_type"] == capability
        ]


def get_busy_units_by_capability(capability: str) -> List[Dict]:
    """Return units of the given capability that are committed to an incident."""
    _load()
    with _lock:
        return [
            dict(u)
            for u in _units
            if u["status"] in BUSY_STATUSES and u["vehicle_type"] == capability
        ]


def assign_unit(
    unit_id: str,
    incident_id: str,
    severity: Optional[str],
    status: str = "EN_ROUTE",
) -> Optional[Dict]:
    """Commit a unit to an incident and set its lifecycle status."""
    _load()
    with _lock:
        u = _find(unit_id)
        if u is None:
            return None
        u["status"] = status
        u["assigned_incident"] = incident_id
        u["assigned_severity"] = severity
        return dict(u)


def update_status(unit_id: str, status: str) -> Optional[Dict]:
    """Transition a unit to a new lifecycle status.

    Moving a unit to AVAILABLE clears its incident assignment.
    """
    status = status.strip().upper()
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{status}'. Must be one of {VALID_STATUSES}.")
    _load()
    with _lock:
        u = _find(unit_id)
        if u is None:
            return None
        u["status"] = status
        if status == "AVAILABLE":
            u["assigned_incident"] = None
            u["assigned_severity"] = None
        return dict(u)


def reset_units() -> List[Dict]:
    """Reload the roster from disk, discarding all live mutations."""
    _load(force=True)
    return get_all_units()
