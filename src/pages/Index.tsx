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
    <div className="flex flex-col h-screen w-screen overflow-hidden relative bg-slate-950">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Ambient glow */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          isCritical 
            ? 'ambient-critical' 
            : 'ambient-glow'
        }`} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 tactical-grid opacity-20" />
        
        {/* Top light effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* Subtle Scanlines */}
      <div className="scanlines" />

      {/* Dispatch Popup */}
      {showPopup && (
        <DispatchPopup 
          data={incidentData} 
          onCancel={resetDashboard}   
          onComplete={resetDashboard} 
        />
      )}

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Dashboard */}
      <main className="flex-1 grid grid-cols-12 gap-5 p-5 min-h-0 w-full relative z-10">
        
        {/* LEFT COLUMN - Communications */}
        <div className="col-span-3 flex flex-col gap-5 min-w-0 h-full">
          {/* Live Call Panel */}
          <div className="h-[45%] panel panel-glow">
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>
          
          {/* Live Transcription Panel */}
          <div className="flex-1 min-h-0 panel panel-glow">
            <LiveTranscription 
              onLineComplete={handleLineComplete} 
              isMuted={isOperatorSpeaking} 
            />
          </div>
        </div>

        {/* MIDDLE COLUMN - Incident Details */}
        <div className="col-span-4 min-w-0 h-full panel panel-glow">
          <IncidentDetails 
            key={resetKey} 
            data={incidentData} 
            isLoading={isAnalyzing} 
          />
        </div>

        {/* RIGHT COLUMN - Map */}
        <div className={`col-span-5 min-w-0 h-full panel ${isCritical ? 'panel-critical' : 'panel-glow'}`}>
          <MapPanel 
            severity={incidentData.severity || "Normal"} 
            isDataComplete={incidentData.location !== "Awaiting data..."} 
          />
        </div>
      </main>
      
      {/* Bottom Status Bar */}
      <div className="relative z-10 px-5 py-2 bg-slate-900/50 border-t border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
            <span className="text-[10px] text-slate-500">All systems operational</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-[10px] text-slate-500">WebSocket: Connected</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500">ResQ-Desk v2.0</span>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-[10px] text-slate-600">© 2024 ResQ Team</span>
        </div>
      </div>
    </div>
  );
};

export default Index;