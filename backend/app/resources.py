import json

def get_available_units_by_capability(capability: str):
    try:
        with open("data/units.json", "r") as f:
            units = json.load(f)

        return [
            u for u in units
            if u["status"] == "AVAILABLE"
            and u["vehicle_type"] == capability
        ]

    except Exception:
        return []
