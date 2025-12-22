import { useState } from "react";
import { Map, Truck, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Unit {
  id: string;
  type: string;
  status: "available" | "busy" | "dispatched";
  distance: number;
  eta: number;
  x: number;
  y: number;
}

const UNITS: Unit[] = [
  { id: "A12", type: "Ambulance", status: "available", distance: 2.3, eta: 6, x: 35, y: 25 },
  { id: "F07", type: "Fire Truck", status: "busy", distance: 4.1, eta: 12, x: 75, y: 35 },
  { id: "R03", type: "Rescue Boat", status: "available", distance: 3.8, eta: 9, x: 20, y: 65 },
  { id: "A08", type: "Ambulance", status: "busy", distance: 5.2, eta: 14, x: 80, y: 70 },
  { id: "R01", type: "Rescue Boat", status: "available", distance: 2.9, eta: 7, x: 55, y: 80 },
];

const INCIDENT_POSITION = { x: 50, y: 50 };

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
}

export function MapPanel({ severity = "critical", isDataComplete = true }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(UNITS[0]);
  const [isDispatched, setIsDispatched] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: Unit["status"]) => {
    switch (status) {
      case "available":
        return "fill-emergency-success stroke-emergency-success";
      case "busy":
        return "fill-emergency-busy stroke-emergency-busy";
      case "dispatched":
        return "fill-blue-500 stroke-blue-500";
    }
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    setSelectedUnit((prev) => ({ ...prev, status: "dispatched" }));
    toast({
      title: "Unit Dispatched Successfully",
      description: `${selectedUnit.type} ${selectedUnit.id} is en route. ETA: ${selectedUnit.eta} minutes.`,
    });
  };

  const dispatchButtonClass = severity === "critical" 
    ? "bg-emergency-critical hover:bg-emergency-critical/90 text-emergency-critical-foreground"
    : "bg-emergency-success hover:bg-emergency-success/90 text-emergency-success-foreground";

  return (
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      {/* Panel Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Map className="w-4 h-4 text-emergency-success" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Map & Resource Matching
        </h2>
      </div>

      {/* Map Visualization */}
      <div className="relative flex-1 mb-4 bg-secondary rounded-lg overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Roads */}
          <path d="M 0 50 L 100 50" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" />
          <path d="M 50 0 L 50 100" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" />
          <path d="M 20 0 L 20 100" stroke="hsl(var(--muted-foreground))" strokeWidth="0.4" opacity="0.2" />
          <path d="M 80 0 L 80 100" stroke="hsl(var(--muted-foreground))" strokeWidth="0.4" opacity="0.2" />

          {/* Incident Location */}
          <circle
            cx={INCIDENT_POSITION.x}
            cy={INCIDENT_POSITION.y}
            r="4"
            className="fill-emergency-critical stroke-emergency-critical"
            strokeWidth="1"
          />
          <circle
            cx={INCIDENT_POSITION.x}
            cy={INCIDENT_POSITION.y}
            r="8"
            className="fill-none stroke-emergency-critical critical-pulse"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* Units */}
          {UNITS.map((unit) => (
            <g key={unit.id} className="cursor-pointer" onClick={() => setSelectedUnit(unit)}>
              <circle
                cx={unit.x}
                cy={unit.y}
                r={selectedUnit.id === unit.id ? "3.5" : "2.5"}
                className={`${getStatusColor(unit.status)} ${selectedUnit.id === unit.id ? "stroke-2" : ""}`}
                strokeWidth={selectedUnit.id === unit.id ? "1" : "0.5"}
              />
              <text
                x={unit.x}
                y={unit.y - 5}
                textAnchor="middle"
                className="fill-foreground text-[3px] font-medium"
              >
                {unit.id}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emergency-critical" />
            <span className="text-muted-foreground">Incident</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emergency-success" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emergency-busy" />
            <span className="text-muted-foreground">Busy</span>
          </div>
        </div>
      </div>

      {/* Resource Suggestion Card */}
      <div className="p-3 bg-secondary rounded-lg border border-border mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emergency-success" />
            <span className="font-semibold text-foreground">
              {selectedUnit.type} {selectedUnit.id}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${
              selectedUnit.status === "available"
                ? "bg-emergency-success/20 text-emergency-success"
                : selectedUnit.status === "dispatched"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-emergency-busy/20 text-emergency-busy"
            }`}
          >
            {selectedUnit.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Navigation className="w-3 h-3" />
            <span>{selectedUnit.distance} km</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>ETA: {selectedUnit.eta} mins</span>
          </div>
        </div>
      </div>

      {/* Dispatch Button */}
      <Button
        size="lg"
        className={`w-full font-bold text-base ${dispatchButtonClass}`}
        disabled={!isDataComplete || isDispatched || selectedUnit.status === "busy"}
        onClick={handleDispatch}
      >
        {isDispatched ? "UNIT DISPATCHED" : "DISPATCH RESCUE UNIT"}
      </Button>
    </div>
  );
}
