// Mirrors backend/app/schemas.py — keep in sync with the Python source of truth.

export interface ReallocationSuggestion {
  unit_id: string;
  from_incident?: string | null;
  from_severity?: string | null;
  to_severity?: string | null;
  eta_minutes?: number | null;
  message: string;
}

export interface IncidentData {
  incident_id?: string;
  location: string;
  emergency_type: string;
  severity: string;
  keywords: string[];
  reasoning: string;
  confidence_score: number;
  suggested_unit?: string | null;
  reallocation?: ReallocationSuggestion | null;
}

export interface FrontendResponse {
  incident_id: string;
  emergency_type: string;
  severity: string;
  location: string;
  reasoning: string;
  confidence_score: number;
  suggested_unit?: string | null;
  keywords: string[];
  reallocation?: ReallocationSuggestion | null;
}

export type UnitStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING';
export type VehicleType = 'AMBULANCE' | 'FIRE_ENGINE' | 'RESCUE_BOAT';

export interface LiveUnit {
  unit_id: string;
  vehicle_type: string;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  eta_minutes: number | null;
  status: string;
  assigned_incident: string | null;
  assigned_severity: string | null;
}
