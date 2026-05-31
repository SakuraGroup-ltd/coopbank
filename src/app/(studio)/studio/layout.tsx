// Studio shell layout — wraps every /studio/* page with the sidebar + content.
// Login page bypasses this via its own sub-layout (no sidebar shown there).
import { Sidebar } from "@/components/studio/Sidebar";
import { getStudioUser } from "@/lib/studio/auth";
import { effectiveRole, ROLE_LABEL, STUDIO_VISIBILITY } from "@/payload/access/roles";
import { computeBadges } from "@/lib/studio/badges";

export const dynamic = "force-dynamic";

export default async function StudioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getStudioUser();
  const role = user ? effectiveRole(user) : "viewer";

  const visibleScopes = Object.entries(STUDIO_VISIBILITY)
    .filter(([, roles]) => roles.includes(role))
    .map(([scope]) => scope);

  // Counts for sidebar attention-badges. Only compute for signed-in users.
  const badges = user ? await computeBadges() : {};

  return (
    <div className="relative min-h-screen flex z-10">
      <Sidebar
        user={
          user
            ? { name: user.name, email: user.email, avatar: undefined }
            : undefined
        }
        visibleScopes={visibleScopes}
        roleLabel={user ? ROLE_LABEL[role] : undefined}
        badges={badges}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
