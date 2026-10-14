/**
 * Dark mode (CAR-169) only reached the navbar, profile, about, and feedback
 * pages. Every other route (analytics, map/home, company, etc.) still has
 * hardcoded light-only styling, so dark mode must stay forced off there
 * until those pages get their own token migration pass.
 */
const DARK_MODE_ROUTE_PREFIXES = ["/profile", "/about", "/feedback"];

export function isDarkModeRoute(pathname: string): boolean {
  return DARK_MODE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
