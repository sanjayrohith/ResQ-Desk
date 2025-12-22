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
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <ClipboardList className="w-4 h-4 text-emergency-success" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Incident Details
        </h2>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
          <Sparkles className="w-3 h-3" />
          AI Generated
        </div>
      </div>

      <div className="grid gap-4 flex-1">
        {/* Location - Now Read Only/Controlled */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            Location
          </Label>
          <Input
            value={data.location}
            readOnly // Make it read-only for the demo effect
            placeholder="Waiting for audio..."
            className="bg-secondary border-border text-foreground"
          />
        </div>

        {/* Emergency Type & Severity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              Emergency Type
            </Label>
            <Select value={data.emergencyType} disabled>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flood-rescue">Flood Rescue</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                {/* ... others ... */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Severity</Label>
            <Select value={data.severity} disabled>
              <SelectTrigger className="bg-secondary border-border text-foreground">
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current Severity:</span>
          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${severityColors[data.severity as keyof typeof severityColors] || severityColors.normal}`}>
            {data.severity || "---"}
          </span>
        </div>

        {/* Victims */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            Victims
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Adults</span>
              <Input value={data.adults} readOnly className="bg-secondary border-border text-foreground text-center" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Children</span>
              <Input value={data.children} readOnly className="bg-secondary border-border text-foreground text-center" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Elderly</span>
              <Input value={data.elderly} readOnly className="bg-secondary border-border text-foreground text-center" />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flag className="w-3 h-3" />
            Special Flags
          </Label>
          <div className="flex flex-wrap gap-2 min-h-[30px]">
            {data.flags.length === 0 && <span className="text-xs text-muted-foreground italic">None detected</span>}
            {data.flags.map((flag, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-emergency-warning/20 text-emergency-warning rounded border border-emergency-warning/30">
                {flag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}