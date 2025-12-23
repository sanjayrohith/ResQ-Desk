import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { DispatchPopup } from "@/components/dashboard/DispatchPopup";

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

  // Critical Alert Logic for Red Background
  const isCritical = incidentData.severity?.toLowerCase() === "critical";

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

      if (backendData.incident_id) {
        setIncidentData(backendData); 
        setTimeout(() => setShowPopup(true), 4000); 
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] overflow-hidden font-mono text-zinc-100 relative selection:bg-cyan-500/30">
      
      {/* 1. CRT SCANLINES (Texture) */}
      <div className="scanlines fixed inset-0 pointer-events-none z-50"></div>

      {/* 2. DYNAMIC AMBIENT GLOW (Reactivity) */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 z-0
          ${isCritical 
            ? "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(220,38,38,0.25)_100%)] animate-pulse-red" 
            : "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(6,182,212,0.05)_100%)]"
          }`} 
      />

      {showPopup && (
        <DispatchPopup 
          data={incidentData} 
          onCancel={resetDashboard}   
          onComplete={resetDashboard} 
        />
      )}

      <div className="relative z-10">
        <Header />
      </div>

      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 w-full relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="col-span-3 flex flex-col gap-4 min-w-0 h-full">
          {/* We apply 'floating-card' HERE, not inside the components */}
          <div className="flex-[0.4] floating-card">
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>
          <div className="flex-1 min-h-0 floating-card">
            <LiveTranscription 
              onLineComplete={handleLineComplete} 
              isMuted={isOperatorSpeaking} 
            />
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="col-span-4 min-w-0 h-full floating-card">
          <IncidentDetails 
            key={resetKey} 
            data={incidentData} 
            isLoading={isAnalyzing} 
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-5 min-w-0 h-full floating-card">
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