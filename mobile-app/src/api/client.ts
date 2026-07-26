import { FrontendResponse, LiveUnit } from './types';

// Same default the web app uses (frontend/src/pages/Index.tsx). Override via
// react-native-config / .env if you stand up your own backend instance.
export const API_URL = 'https://resq-backend-9585.onrender.com';

export async function analyzeTranscript(text: string): Promise<FrontendResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Server Error: ${res.status}`);
  return res.json();
}

export async function fetchUnits(): Promise<LiveUnit[]> {
  const res = await fetch(`${API_URL}/units`);
  if (!res.ok) throw new Error(`Server Error: ${res.status}`);
  return res.json();
}

export async function reallocateUnit(params: {
  unit_id: string;
  incident_id?: string;
  severity?: string;
}): Promise<void> {
  await fetch(`${API_URL}/units/reallocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query,
  )}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}
