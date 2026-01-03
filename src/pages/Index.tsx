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
      const API_URL = import.meta.env.VITE_API_URL || "https://resq-backend-9585.onrender.com";
      console.log("🚀 Sending audio data to:", `${API_URL}/analyze`);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const backendData = await response.json();
      console.log("✅ Backend Replied:", backendData);

      if (backendData.incident_id) {
        setIncidentData(backendData); 
        setTimeout(() => setShowPopup(true), 4000); 
      }
    } catch (error) {
      console.error("❌ Sync Error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    // FIX 1: h-screen and overflow-hidden prevent the whole page from scrolling
    <div className="flex flex-col h-screen w-screen overflow-hidden relative bg-slate-950 text-slate-200">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className={`absolute inset-0 transition-all duration-1000 ${isCritical ? 'ambient-critical' : 'ambient-glow'}`} />
        <div className="absolute inset-0 tactical-grid opacity-20" />
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      <div className="scanlines z-0" />

      {/* Dispatch Popup */}
      {showPopup && (
        <DispatchPopup 
          data={incidentData} 
          onCancel={resetDashboard}   
          onComplete={resetDashboard} 
        />
      )}

      {/* Header - Fixed Height */}
      <div className="relative z-10 shrink-0">
        <Header />
      </div>

      {/* Main Dashboard - Takes Remaining Height */}
      {/* FIX 2: min-h-0 is crucial for Grid to respect parent height */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 w-full relative z-10">
        
        {/* LEFT COLUMN - Communications */}
        <div className="col-span-3 flex flex-col gap-4 h-full min-h-0">
          {/* Live Call Panel (Fixed 40% height) */}
          <div className="h-[50%] panel panel-glow relative overflow-hidden">
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>
          
          {/* Live Transcription Panel (Flex Grow fills rest) */}
          {/* FIX 3: Wrapper needs h-full or flex-1 to pass height down */}
          <div className="flex-1 panel panel-glow relative overflow-hidden min-h-0">
            <LiveTranscription 
              onLineComplete={handleLineComplete} 
              isMuted={isOperatorSpeaking} 
            />
          </div>
        </div>

        {/* MIDDLE COLUMN - Incident Details */}
        <div className="col-span-4 h-full panel panel-glow relative overflow-hidden">
          <IncidentDetails 
            key={resetKey} 
            data={incidentData} 
            isLoading={isAnalyzing} 
          />
        </div>

        {/* RIGHT COLUMN - Map */}
        <div className={`col-span-5 h-full panel relative overflow-hidden ${isCritical ? 'panel-critical' : 'panel-glow'}`}>
          <MapPanel 
            severity={incidentData.severity || "Normal"} 
            isDataComplete={incidentData.location !== "Awaiting data..."} 
          />
        </div>
      </main>
      
      {/* Bottom Status Bar - Fixed Height */}
      <div className="relative z-10 shrink-0 px-5 py-2 bg-slate-900/50 border-t border-slate-700/30 flex items-center justify-between text-[10px] backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
            <span className="text-slate-400 font-mono tracking-wide">SYSTEM OPERATIONAL</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-slate-500 font-mono">WS_LINK: ESTABLISHED</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-mono">ResQ-Desk v2.0 (HACKATHON BUILD)</span>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-slate-600">© 2024 ResQ Team</span>
        </div>
      </div>
    </div>
  );
};

export default Index;