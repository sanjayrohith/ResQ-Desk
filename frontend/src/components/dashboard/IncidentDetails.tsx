import { useCountUp } from "@/hooks/useCountUp";

export interface IncidentData {
  location?: string;
  emergency_type?: string;
  severity?: string;
  keywords?: string[];
  reasoning?: string;
  confidence_score?: number;
  suggested_unit?: string;
  reallocation?: {
    unit_id: string;
    from_incident?: string | null;
    from_severity?: string | null;
    message: string;
  } | null;
}

interface IncidentDetailsProps {
  data: IncidentData;
  isLoading?: boolean;
}

// Dot and text color per severity. Red is reserved for critical.
const SEVERITY_STYLE: Record<string, { dot: string; text: string }> = {
  Critical: { dot: "bg-crit", text: "text-crit" },
  High: { dot: "bg-signal", text: "text-signal" },
  Medium: { dot: "bg-ink-2", text: "text-ink" },
  Low: { dot: "bg-ok", text: "text-ink" },
  Normal: { dot: "bg-ink-3", text: "text-ink-2" },
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-raised ${className}`} />
);

export function IncidentDetails({ data, isLoading }: IncidentDetailsProps) {
  const hasData = !!data.location && data.location !== "Awaiting data";

  const safeSeverity = data.severity
    ? data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()
    : "Normal";
  const severityStyle = SEVERITY_STYLE[safeSeverity] || SEVERITY_STYLE.Normal;
  const confidencePercent = hasData && data.confidence_score ? Math.round(data.confidence_score * 100) : 0;
  const animatedConfidence = useCountUp(confidencePercent, 1200);
  const displayConfidence = Math.round(animatedConfidence);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">Incident report</span>
        <span className="meta flex items-center gap-2">
          <span className={`dot ${isLoading ? "bg-signal dot-live" : hasData ? "bg-ok" : "bg-ink-3"}`} />
          {isLoading ? "Analyzing" : hasData ? "Complete" : "Awaiting input"}
        </span>
      </div>

      <div className="scrollbar-tactical flex-1 space-y-5 overflow-y-auto p-5">
        {/* Type and severity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="well p-4">
            <div className="label mb-2">Emergency type</div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-2xl font-medium leading-8 ${hasData ? "text-ink" : "text-ink-3"}`}>
                {hasData ? data.emergency_type : "—"}
              </div>
            )}
          </div>

          <div className="well p-4">
            <div className="label mb-2">Severity</div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : hasData ? (
              <div className={`flex items-center gap-2 text-2xl font-medium leading-8 ${severityStyle.text}`}>
                <span className={`dot h-2 w-2 ${severityStyle.dot}`} />
                {safeSeverity}
              </div>
            ) : (
              <div className="text-2xl font-medium leading-8 text-ink-3">—</div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="label mb-2">Location</div>
          {isLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            <div className={`text-base leading-6 ${hasData ? "text-ink" : "text-ink-3"}`}>
              {hasData ? data.location : "Waiting for location"}
            </div>
          )}
        </div>

        {/* Confidence */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="label">Confidence</span>
            <span className={`figure text-sm ${hasData ? "text-ink" : "text-ink-3"}`}>
              {isLoading ? "—" : `${displayConfidence}%`}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: isLoading ? "0%" : `${animatedConfidence}%` }}
            />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <div className="label mb-2">Keywords</div>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
          ) : hasData && data.keywords && data.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((k, i) => (
                <span key={i} className="keyword-tag">
                  {k.toLowerCase()}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-ink-3">No keywords detected</div>
          )}
        </div>

        {/* Reasoning */}
        <div>
          <div className="label mb-2">Reasoning</div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className={`text-sm leading-6 ${hasData ? "text-ink-2" : "text-ink-3"}`}>
              {hasData ? data.reasoning : "Waiting for analysis"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
