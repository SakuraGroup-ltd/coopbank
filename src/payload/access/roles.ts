// Single source of truth for CoopBank's CMS role model.
// Roles ARE the access model — we don't combine role + department any more.
// Each named role owns one collection scope; admin owns all; master_admin
// additionally owns user management. Viewer is read-everywhere.

export const ROLES = [
  "master_admin",
  "admin",
  "marketer",
  "hr",
  "procurement",
  "treasurer",
  "compliance",
  "network",
  "viewer",
] as const;

export type Role = (typeof ROLES)[number];

// Human labels for the UI.
export const ROLE_LABEL: Record<Role, string> = {
  master_admin: "Master Admin",
  admin: "Admin",
  marketer: "Marketer",
  hr: "Human Resources",
  procurement: "Procurement",
  treasurer: "Treasurer",
  compliance: "Compliance & Risk",
  network: "Network Operations",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  master_admin: "Full system access. Manages users and other admins. Limit to 1-2 people.",
  admin: "Manages every collection. Can promote users to scoped roles but not to admin/master.",
  marketer: "Owns marketing surfaces: pages, blog, homepage, header, footer, site settings.",
  hr: "Owns job listings and recruitment content.",
  procurement: "Owns tender notices and supplier-facing content.",
  treasurer: "Updates daily forex rates and treasury content.",
  compliance: "Triages whistleblower reports and risk disclosures.",
  network: "Manages branches, agencies and ATM listings.",
  viewer: "Read-only across every collection.",
};

// Which roles can SEE the navigation entry for each Studio surface.
// Master admin / admin / viewer see everything; scoped roles see their
// dashboard + their one collection.
export const STUDIO_VISIBILITY: Record<string, Role[]> = {
  dashboard:    ["master_admin", "admin", "viewer", "marketer", "hr", "procurement", "treasurer", "compliance", "network"],
  forex:        ["master_admin", "admin", "viewer", "treasurer"],
  blog:         ["master_admin", "admin", "viewer", "marketer"],
  pages:        ["master_admin", "admin", "viewer", "marketer"],
  library:        ["master_admin", "admin", "viewer", "marketer", "hr", "procurement", "compliance", "network"],
  jobs:         ["master_admin", "admin", "viewer", "hr"],
  tenders:      ["master_admin", "admin", "viewer", "procurement"],
  branches:     ["master_admin", "admin", "viewer", "network"],
  whistleblower:["master_admin", "admin", "viewer", "compliance"],
  users:        ["master_admin", "admin"],
  settings:     ["master_admin", "admin", "marketer"],
  // New surfaces
  faqs:         ["master_admin", "admin", "viewer", "marketer"],
  auctions:     ["master_admin", "admin", "viewer", "treasurer"],
  rates:        ["master_admin", "admin", "viewer", "treasurer"],
  press:        ["master_admin", "admin", "viewer", "marketer"],
  fees:         ["master_admin", "admin", "viewer", "marketer", "procurement"],
  activity:     ["master_admin", "admin", "viewer", "compliance"],
  reports:      ["master_admin", "admin", "viewer", "marketer"],
  notices:      ["master_admin", "admin", "viewer", "compliance"],
  leadership:   ["master_admin", "admin", "viewer", "marketer"],
};

// Which roles can EDIT each collection. Read access is broader (handled in
// collection access functions): everyone signed in can read, scoped editors
// can edit their scope, admins/master edit everything.
export const CAN_EDIT: Record<string, Role[]> = {
  forex:        ["master_admin", "admin", "treasurer"],
  blog:         ["master_admin", "admin", "marketer"],
  pages:        ["master_admin", "admin", "marketer"],
  library:        ["master_admin", "admin", "marketer", "hr", "procurement", "compliance", "network"],
  jobs:         ["master_admin", "admin", "hr"],
  tenders:      ["master_admin", "admin", "procurement"],
  branches:     ["master_admin", "admin", "network"],
  whistleblower:["master_admin", "admin", "compliance"],
  users:        ["master_admin", "admin"],
  globals:      ["master_admin", "admin", "marketer"],
  faqs:         ["master_admin", "admin", "marketer"],
  auctions:     ["master_admin", "admin", "treasurer"],
  rates:        ["master_admin", "admin", "treasurer"],
  press:        ["master_admin", "admin", "marketer"],
};

// Compatibility shim — old data has role=admin/editor/viewer, with editors
// carrying a `departments` array. Map them at runtime so we don't need a DB
// migration before the new UI lands.
export function effectiveRole(user: {
  role?: string;
  departments?: string[];
}): Role {
  const r = user.role || "viewer";
  if ((ROLES as readonly string[]).includes(r)) return r as Role;
  if (r === "admin") return "admin";
  if (r === "viewer") return "viewer";
  if (r === "editor") {
    const depts = user.departments || [];
    if (depts.length > 1) return "admin"; // broad scope → treat as admin
    const d = depts[0];
    if (d === "marketing") return "marketer";
    if (d === "hr") return "hr";
    if (d === "operations") return "procurement";
    if (d === "treasury") return "treasurer";
    if (d === "compliance") return "compliance";
    if (d === "busdev") return "network";
    return "viewer";
  }
  return "viewer";
}

export function isMasterAdmin(user: { role?: string }): boolean {
  return user?.role === "master_admin";
}

export function isAnyAdmin(user: { role?: string; departments?: string[] }): boolean {
  const r = effectiveRole(user);
  return r === "master_admin" || r === "admin";
}

export function canEdit(
  user: { role?: string; departments?: string[] } | null | undefined,
  scope: keyof typeof CAN_EDIT,
): boolean {
  if (!user) return false;
  const r = effectiveRole(user);
  return CAN_EDIT[scope]?.includes(r) ?? false;
}
