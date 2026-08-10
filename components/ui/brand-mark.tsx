import { clsx } from "clsx";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={clsx("shrink-0", className)} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path d="M9 10.5h5.5V16H9zM17.5 10.5H23V16h-5.5zM9 19h5.5v4H9zM17.5 19H23v4h-5.5z" fill="var(--brand-cutout, #e7ff8f)" />
    </svg>
  );
}

