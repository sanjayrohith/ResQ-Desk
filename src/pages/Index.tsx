import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { IncidentData } from "@/components/dashboard/IncidentDetails";
import { DispatchPopup } from "@/components/dashboard/DispatchPopup";

// 1. DEFINE EMPTY STATE
// Use a function to ensure we always get a FRESH object, not a reference
const getInitialState = (): IncidentData => ({
  location: "Awaiting data...",
  emergency_type: "Pending",
  severity: "Normal",
  keywords: [],
  reasoning: "System standby. Waiting for voice input...",
  confidence_score: 0
});

const Index = () => {
  const [incidentData, setIncidentData] = useState<IncidentData>(getInitialState());
  const [fullApiResponse, setFullApiResponse] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isOperatorSpeaking, setIsOperatorSpeaking] = useState(false);
  
  // 2. NEW: Session ID for forcing hard resets
  const [resetKey, setResetKey] = useState(0);

  // 3. THE RESET FUNCTION
  const resetDashboard = () => {
    console.log("🛑 HARD RESET TRIGGERED");
    setShowPopup(false);
    
    // Force a React re-render by updating the key
    setResetKey(prev => prev + 1);
    
    // Wipe data with a fresh object copy
    setIncidentData(getInitialState());
    setFullApiResponse(null);       
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

      if (backendData.analysis) {
        setIncidentData(backendData.analysis);
        setFullApiResponse(backendData);
        setTimeout(() => setShowPopup(true), 500);
      }

    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden font-mono text-zinc-100">
      
      {showPopup && fullApiResponse && (
        <DispatchPopup 
          data={fullApiResponse} 
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
          {/* 4. USE RESET KEY HERE 
             This guarantees the component is destroyed and recreated empty on every reset.
          */}
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