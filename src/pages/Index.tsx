import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
import { IncidentData } from "@/components/dashboard/IncidentDetails";

const Index = () => {
  const [incidentData, setIncidentData] = useState<IncidentData>({
    location: "",
    emergencyType: "",
    severity: "normal",
    adults: "0",
    children: "0",
    elderly: "0",
    flags: [],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLineComplete = async (transcript: string) => {
    if (!transcript || transcript.length < 5) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) throw new Error(`Backend Error: ${response.status}`);
      const aiData: IncidentData = await response.json();
      setIncidentData(aiData);
    } catch (error) {
      console.error("AI Backend Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />

      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 w-full">
        {/* LEFT COLUMN (Comms + Intel) */}
        <div className="col-span-3 flex flex-col gap-4 min-w-0 h-full">
          {/* Comms Channel */}
          <div className="h-[45%]">
            <LiveCall />
          </div>
          
          {/* Real-Time Intel */}
          <div className="flex-1 min-h-0">
            <LiveTranscription onLineComplete={handleLineComplete} />
          </div>
        </div>

        {/* MIDDLE COLUMN (Incident Details) */}
        <div className="col-span-4 min-w-0 h-full">
          <IncidentDetails data={incidentData} isLoading={isAnalyzing} />
        </div>

        {/* RIGHT COLUMN (Resource Matching) */}
        <div className="col-span-5 min-w-0 h-full">
          <MapPanel 
            severity={incidentData.severity || "normal"} 
            isDataComplete={!!incidentData.location} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;