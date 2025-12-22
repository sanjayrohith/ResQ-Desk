import { ClipboardList, Sparkles, MapPin, AlertCircle, Users, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Export this interface so the parent knows what to send
export interface IncidentData {
  location: string;
  emergencyType: string;
  severity: string;
  adults: string;
  children: string;
  elderly: string;
  flags: string[];
}

interface IncidentDetailsProps {
  data: IncidentData; // Receive data as Prop
}

export function IncidentDetails({ data }: IncidentDetailsProps) {
  
  // NOTE: I removed the internal useState. We rely on props now.

  const severityColors = {
    critical: "bg-emergency-critical text-emergency-critical-foreground",
    high: "bg-emergency-warning text-emergency-warning-foreground",
    medium: "bg-yellow-600 text-white",
    low: "bg-emergency-success text-emergency-success-foreground",
    normal: "bg-secondary text-muted-foreground" // Added default
  };

  return (
    <div className="flex flex-col h-full p-6 bg-panel rounded-xl border border-border shadow-lg">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emergency-success/20">
          <ClipboardList className="w-4 h-4 text-emergency-success" />
        </div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Incident Details
        </h2>
      </div>

      <div className="grid gap-5 flex-1 overflow-y-auto pb-2">
        {/* Location - Now Read Only/Controlled */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5" />
            Location
          </Label>
          <Input
            value={data.location}
            readOnly // Make it read-only for the demo effect
            placeholder="Waiting for audio..."
            className="bg-secondary/60 border-border text-foreground h-10"
          />
        </div>

        {/* Emergency Type & Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5" />
              Emergency Type
            </Label>
            <Select value={data.emergencyType} disabled>
              <SelectTrigger className="bg-secondary/60 border-border text-foreground h-10">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flood-rescue">Flood Rescue</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                {/* ... others ... */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Severity</Label>
            <Select value={data.severity} disabled>
              <SelectTrigger className="bg-secondary/60 border-border text-foreground h-10">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Current Severity:</span>
          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md ${severityColors[data.severity as keyof typeof severityColors] || severityColors.normal}`}>
            {data.severity || "---"}
          </span>
        </div>

        {/* Victims */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Users className="w-3.5 h-3.5" />
            Victims
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Adults</span>
              <Input value={data.adults} readOnly className="bg-secondary/60 border-border text-foreground text-center h-10 font-semibold" />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Children</span>
              <Input value={data.children} readOnly className="bg-secondary/60 border-border text-foreground text-center h-10 font-semibold" />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Elderly</span>
              <Input value={data.elderly} readOnly className="bg-secondary/60 border-border text-foreground text-center h-10 font-semibold" />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Flag className="w-3.5 h-3.5" />
            Special Flags
          </Label>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-secondary/40 rounded-lg border border-border">
            {data.flags.length === 0 && <span className="text-xs text-muted-foreground italic">None detected</span>}
            {data.flags.map((flag, i) => (
              <span key={i} className="px-3 py-1.5 text-xs font-semibold bg-emergency-warning/20 text-emergency-warning rounded-md border border-emergency-warning/30">
                {flag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}