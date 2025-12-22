import { Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel } from "@/components/dashboard";

const Index = () => {
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
          <LiveTranscription />
        </div>

        {/* Right Side - Row 1: Incident Details */}
        <div className="row-start-1 col-start-2">
          <IncidentDetails />
        </div>

        {/* Right Side - Row 2: Map Panel */}
        <div className="row-start-2 col-start-2">
          <MapPanel severity="critical" isDataComplete={true} />
        </div>
      </div>
    </div>
  );
};

export default Index;
