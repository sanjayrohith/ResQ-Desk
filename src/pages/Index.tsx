import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { IncidentData } from "@/components/dashboard/IncidentDetails";
import { DispatchPopup } from "@/components/dashboard/DispatchPopup";

const Index = () => {
  const [incidentData, setIncidentData] = useState<IncidentData>({
    location: "Awaiting data...",
    emergency_type: "Pending",
    severity: "Normal",
    keywords: [],
    reasoning: "System standby. Waiting for voice input...",
    confidence_score: 0
  });

  const [fullApiResponse, setFullApiResponse] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // 1. New State for Operator Override
  const [isOperatorSpeaking, setIsOperatorSpeaking] = useState(false);

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
          onCancel={() => setShowPopup(false)}
          onComplete={() => setShowPopup(false)} 
        />
      )}

      <Header />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0 w-full">
        {/* LEFT COLUMN */}
        <div className="col-span-3 flex flex-col gap-3 min-w-0 h-full">
          <div className="flex-[0.4] glass-panel relative overflow-hidden">
            {/* 2. Pass State Handler */}
            <LiveCall onPTTChange={setIsOperatorSpeaking} />
          </div>
          <div className="flex-1 min-h-0 glass-panel relative overflow-hidden">
            {/* 3. Pass Mute State */}
            <LiveTranscription 
              onLineComplete={handleLineComplete} 
              isMuted={isOperatorSpeaking} 
            />
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="col-span-4 min-w-0 h-full">
          <IncidentDetails data={incidentData} isLoading={isAnalyzing} />
        </div>

        {/* RIGHT COLUMN */}
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