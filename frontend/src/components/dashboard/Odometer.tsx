interface OdometerProps {
  /** A string of digits and separators, e.g. "21:45:36". */
  value: string;
  className?: string;
}

function OdometerDigit({ digit }: { digit: number }) {
  return (
    <span className="odometer-digit">
      <span
        className="odometer-track"
        style={{ transform: `translateY(-${digit}em)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="odometer-cell">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Renders a numeric string where each digit rolls vertically to its new value,
 * like a mechanical odometer / split-flap display. Non-digit characters
 * (colons, spaces) are rendered statically.
 */
export function Odometer({ value, className }: OdometerProps) {
  return (
    <span className={className} style={{ display: "inline-flex" }}>
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <OdometerDigit key={i} digit={Number(ch)} />
        ) : (
          <span key={i} className="odometer-sep">
            {ch}
          </span>
        )
      )}
    </span>
  );
}
