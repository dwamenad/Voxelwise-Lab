import { clsx } from "clsx";

export function ProgressBar({ value, className, label = "Course progress" }: { value: number; className?: string; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx("progress-track", className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <span style={{ width: `${safeValue}%` }} />
    </div>
  );
}

