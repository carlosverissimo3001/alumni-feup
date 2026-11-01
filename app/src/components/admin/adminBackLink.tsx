import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminBackLinkProps = {
  href: string;
  className?: string;
};

// Single back-navigation pattern for every /admin/* subpage: a quiet link to
// the immediate parent, not router.back() - predictable regardless of how
// the page was reached (direct link, refresh, bookmark).
export function AdminBackLink({ href, className }: AdminBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </Link>
  );
}
