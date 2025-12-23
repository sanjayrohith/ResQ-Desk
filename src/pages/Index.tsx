import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { DispatchPopup } from "@/components/dashboard/DispatchPopup";

// 1. UPDATE INTERFACE (Matches your new Backend Schema)
export interface IncidentData {
  incident_id?: string;
  location: string;
  emergency_type: string;
  severity: string;
  keywords: string[];
  reasoning: string;
  confidence_score: number;
  suggested_unit?: string;
}

const getInitialState = (): IncidentData => ({
  location: "Awaiting data...",
  emergency_type: "Pending",
  severity: "Normal",
  keywords: [],
  reasoning: "System standby. Waiting for voice input...",
  confidence_score: 0,
  suggested_unit: ""
});

const Index = () => {
  const [incidentData, setIncidentData] = useState<IncidentData>(getInitialState());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isOperatorSpeaking, setIsOperatorSpeaking] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const resetDashboard = () => {
    console.log("🛑 DASHBOARD RESET");
    setShowPopup(false);
    setResetKey(prev => prev + 1);
    setIncidentData(getInitialState());
  };

  const handleLineComplete = async (transcript: string) => {
    if (!transcript || transcript.length < 2) return;
    
    setIsAnalyzing(true); 

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const backendData = await response.json();
      console.log("🔥 Backend Data Received:", backendData);

      // --- THE FIX ---
      // Check for 'incident_id' directly (Flat Structure)
      if (backendData.incident_id) {
        
        // 1. Update the UI (Judges see the auto-fill happen)
        setIncidentData(backendData); 

        // 2. Wait 4 Seconds, THEN show the popup
        setTimeout(() => {
          setShowPopup(true);
        }, 4000); 
      }

    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden font-mono text-zinc-100">
      
      {showPopup && (
        <DispatchPopup 
          data={incidentData} // Pass the flat data directly
          onCancel={resetDashboard}   
          onComplete={resetDashboard} 
        />
      )}

      <Header />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0 w-full">
        <div className="col-span-3 flex flex-col gap-3 min-w-0 h-full">
          <div className="flex-[0.4] glass-panel relative overflow-hidden">
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>
          <div className="flex-1 min-h-0 glass-panel relative overflow-hidden">
            <LiveTranscription 
              onLineComplete={handleLineComplete} 
              isMuted={isOperatorSpeaking} 
            />
          </div>
        </div>

        <div className="col-span-4 min-w-0 h-full">
          {/* Key prop ensures the typing animation replays on reset */}
          <IncidentDetails 
            key={resetKey} 
            data={incidentData} 
            isLoading={isAnalyzing} 
          />
        </div>

        <div className="col-span-5 min-w-0 h-full glass-panel relative overflow-hidden">
          <MapPanel 
            severity={incidentData.severity || "Normal"} 
            isDataComplete={incidentData.location !== "Awaiting data..."} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;