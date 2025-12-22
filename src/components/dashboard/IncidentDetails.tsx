import { useState } from "react";
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

interface IncidentData {
  location: string;
  emergencyType: string;
  severity: string;
  adults: string;
  children: string;
  elderly: string;
  flags: string[];
}

export function IncidentDetails() {
  const [data, setData] = useState<IncidentData>({
    location: "Perumal Temple, Velachery",
    emergencyType: "flood-rescue",
    severity: "critical",
    adults: "2",
    children: "0",
    elderly: "1",
    flags: ["Elderly", "Mobility Issue"],
  });

  const updateField = (field: keyof IncidentData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const severityColors = {
    critical: "bg-emergency-critical text-emergency-critical-foreground",
    high: "bg-emergency-warning text-emergency-warning-foreground",
    medium: "bg-yellow-600 text-white",
    low: "bg-emergency-success text-emergency-success-foreground",
  };

  return (
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      {/* Panel Header */}
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

      {/* Form Fields */}
      <div className="grid gap-4 flex-1">
        {/* Location */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            Location
          </Label>
          <Input
            value={data.location}
            onChange={(e) => updateField("location", e.target.value)}
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
            <Select value={data.emergencyType} onValueChange={(v) => updateField("emergencyType", v)}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flood-rescue">Flood Rescue</SelectItem>
                <SelectItem value="fire">Fire Emergency</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="earthquake">Earthquake</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Severity</Label>
            <Select value={data.severity} onValueChange={(v) => updateField("severity", v)}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
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

        {/* Severity Badge Display */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current Severity:</span>
          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${severityColors[data.severity as keyof typeof severityColors]}`}>
            {data.severity}
          </span>
        </div>

        {/* Victims Count */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            Victims
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Adults</span>
              <Input
                type="number"
                value={data.adults}
                onChange={(e) => updateField("adults", e.target.value)}
                className="bg-secondary border-border text-foreground text-center"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Children</span>
              <Input
                type="number"
                value={data.children}
                onChange={(e) => updateField("children", e.target.value)}
                className="bg-secondary border-border text-foreground text-center"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Elderly</span>
              <Input
                type="number"
                value={data.elderly}
                onChange={(e) => updateField("elderly", e.target.value)}
                className="bg-secondary border-border text-foreground text-center"
              />
            </div>
          </div>
        </div>

        {/* Special Flags */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flag className="w-3 h-3" />
            Special Flags
          </Label>
          <div className="flex flex-wrap gap-2">
            {data.flags.map((flag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-emergency-warning/20 text-emergency-warning rounded border border-emergency-warning/30"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
