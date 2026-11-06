import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { DispatchPopup } from "@/components/dashboard/DispatchPopup";

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
  suggested_unit?: string;
  reallocation?: ReallocationSuggestion | null;
}

export const AWAITING_LOCATION = "Awaiting data";

const getInitialState = (): IncidentData => ({
  location: AWAITING_LOCATION,
  emergency_type: "Pending",
  severity: "Normal",
  keywords: [],
  reasoning: "System standby. Waiting for voice input",
  confidence_score: 0,
  suggested_unit: ""
});

const Index = () => {
  const [incidentData, setIncidentData] = useState<IncidentData>(getInitialState());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isOperatorSpeaking, setIsOperatorSpeaking] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const isCritical = incidentData.severity?.toLowerCase() === "critical";

  const resetDashboard = () => {
    console.log("Dashboard reset");
    setShowPopup(false);
    setResetKey(prev => prev + 1);
    setIncidentData(getInitialState());
  };

  const handleLineComplete = async (transcript: string) => {
    if (!transcript || transcript.length < 2) return;
    setIsAnalyzing(true); 

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://resq-backend-9585.onrender.com";
      console.log("Sending transcript to:", `${API_URL}/analyze`);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const backendData = await response.json();
      console.log("Backend replied:", backendData);

      if (backendData.incident_id) {
        setIncidentData(backendData); 
        setTimeout(() => setShowPopup(true), 4000); 
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base text-ink">
      {/* Dispatch popup */}
      {showPopup && (
        <DispatchPopup
          data={incidentData}
          onCancel={resetDashboard}
          onComplete={resetDashboard}
        />
      )}

      <div className="shrink-0">
        <Header />
      </div>

      <main className="grid min-h-0 w-full flex-1 grid-cols-12 gap-4 p-4">
        {/* Communications */}
        <div className="panel-entrance delay-1 col-span-3 flex h-full min-h-0 flex-col gap-4">
          <div className="panel shrink-0">
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>

          <div className="panel min-h-0 flex-1">
            <LiveTranscription
              onLineComplete={handleLineComplete}
              isMuted={isOperatorSpeaking}
            />
          </div>
        </div>

        {/* Incident details */}
        <div className="panel panel-entrance delay-2 col-span-4 h-full">
          <IncidentDetails
            key={resetKey}
            data={incidentData}
            isLoading={isAnalyzing}
          />
        </div>

        {/* Map */}
        <div className={`panel panel-entrance delay-3 col-span-5 h-full ${isCritical ? "panel-critical" : ""}`}>
          <MapPanel
            severity={incidentData.severity || "Normal"}
            isDataComplete={incidentData.location !== AWAITING_LOCATION}
            location={incidentData.location}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
