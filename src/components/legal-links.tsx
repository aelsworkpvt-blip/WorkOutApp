import Link from "next/link";
import { cn } from "@/lib/utils";

export function LegalLinks({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const linkClass = inverted
    ? "text-white/72 hover:text-white"
    : "text-[var(--muted-light)] hover:text-[#171717]";

  return (
    <div className={cn("flex flex-wrap gap-4 text-sm", className)}>
      <Link
        href="/privacy"
        className={cn(
          "underline decoration-transparent underline-offset-4 transition hover:decoration-current",
          linkClass,
        )}
      >
        Privacy policy
      </Link>
      <Link
        href="/account/delete"
        className={cn(
          "underline decoration-transparent underline-offset-4 transition hover:decoration-current",
          linkClass,
        )}
      >
        Delete account
      </Link>
    </div>
  );
}
