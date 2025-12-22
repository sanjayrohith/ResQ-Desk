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

      {/* Main Grid - 3 columns, 2 rows */}
      <div className="flex-1 grid grid-cols-[320px_1fr] grid-rows-2 gap-3 p-3 min-h-0">
        
        {/* Left Column - Row 1: Live Call */}
        <div className="row-start-1 col-start-1">
          <LiveCall />
        </div>

        {/* Left Column - Row 2: Live Transcription */}
        <div className="row-start-2 col-start-1">
          {/* Passes the text to the backend handler */}
          <LiveTranscription onLineComplete={handleLineComplete} />
        </div>

        {/* Right Side - Row 1: Incident Details */}
        <div className="row-start-1 col-start-2">
          {/* Displays the data received from Bedrock */}
          <IncidentDetails data={incidentData} />
        </div>

        {/* Right Side - Row 2: Map Panel */}
        <div className="row-start-2 col-start-2">
          {/* Map reacts to severity changes (e.g., turns red if Critical) */}
          <MapPanel 
            severity={incidentData.severity || "normal"} 
            isDataComplete={!!incidentData.location} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;