import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { IncidentData } from "@/components/dashboard/IncidentDetails";

const Index = () => {
  // MASTER STATE - Perfectly synced with Backend AIAnalysis
  const [incidentData, setIncidentData] = useState<IncidentData>({
    location: "Awaiting data...",
    emergency_type: "Pending",
    severity: "Normal",
    keywords: [],
    reasoning: "System standby. Waiting for voice input...",
    confidence_score: 0
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLineComplete = async (transcript: string) => {
    if (!transcript || transcript.length < 5) return;
    
    setIsAnalyzing(true); 

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const aiData: IncidentData = await response.json();
      setIncidentData(aiData); 

    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden font-mono text-zinc-100">
      <Header />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0 w-full">
        {/* LEFT COLUMN (Comms + Intel) */}
        <div className="col-span-3 flex flex-col gap-3 min-w-0 h-full">
          <div className="flex-[0.4] glass-panel relative overflow-hidden">
            <LiveCall />
          </div>
          <div className="flex-1 min-h-0 glass-panel relative overflow-hidden">
            <LiveTranscription onLineComplete={handleLineComplete} />
          </div>
        </div>

        {/* MIDDLE COLUMN (Incident Details) */}
        <div className="col-span-4 min-w-0 h-full">
          <IncidentDetails data={incidentData} isLoading={isAnalyzing} />
        </div>

        {/* RIGHT COLUMN (Map & Resources) */}
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