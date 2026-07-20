"""
Resource lookup layer.

Historically this read `data/units.json` directly on every call. It now delegates
to `unit_state`, the in-memory live state store, so availability reflects real-time
dispatch and reallocation rather than the static seed file.
"""

from app import unit_state


def get_available_units_by_capability(capability: str):
    """Return AVAILABLE units matching the requested capability (live state)."""
    return unit_state.get_available_units_by_capability(capability)
