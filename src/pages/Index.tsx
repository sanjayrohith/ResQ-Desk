import { useState } from "react";
import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";
// Ensure this path matches where your interface is defined
import { IncidentData } from "@/components/dashboard/IncidentDetails";

const Index = () => {
  // 1. MASTER STATE (The "Brain" of the page)
  const [incidentData, setIncidentData] = useState<IncidentData>({
    location: "",
    emergencyType: "",
    severity: "normal", // Default value
    adults: "0",
    children: "0",
    elderly: "0",
    flags: [],
  });

  // 2. THE REAL BACKEND LOGIC
  // This function triggers every time a line finishes in LiveTranscription
  const handleLineComplete = async (transcript: string) => {
    
    // Safety check: Don't send empty text
    if (!transcript || transcript.length < 5) return;

    try {
      console.log("Sending to Bedrock:", transcript);

      // A. Send the transcript to your local Python Backend
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
      }

      // B. Get the structured JSON from AI
      const aiData: IncidentData = await response.json();
      console.log("AI Extracted Data:", aiData);

      // C. Update the UI instantly
      setIncidentData(aiData);

    } catch (error) {
      console.error("Failed to connect to AI Backend:", error);
      // Optional: You could set an error state here or show a toast notification
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Dashboard Grid - Professional 3-column layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 max-w-[2000px] mx-auto w-full">
        
        {/* Left Sidebar - Call Controls (3 columns wide) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Live Call Panel */}
          <div className="flex-[0.4] min-h-[280px]">
            <LiveCall />
          </div>

          {/* Live Transcription Panel */}
          <div className="flex-1 min-h-[400px]">
            <LiveTranscription onLineComplete={handleLineComplete} />
          </div>
        </div>

        {/* Middle Section - Incident Details (4 columns wide) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
          <div className="flex-1 min-h-[600px]">
            <IncidentDetails data={incidentData} />
          </div>
        </div>

        {/* Right Section - Map & Resources (5 columns wide) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0">
          <div className="flex-1 min-h-[600px]">
            <MapPanel 
              severity={incidentData.severity || "normal"} 
              isDataComplete={!!incidentData.location} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;