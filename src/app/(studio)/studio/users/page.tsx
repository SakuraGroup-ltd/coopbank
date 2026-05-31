import Link from "next/link";
import { ChevronRight, Plus, Users as UsersIcon, Shield, Crown } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";
import { Avatar } from "@/components/studio/ui/Avatar";
import { effectiveRole, ROLE_LABEL, ROLE_DESCRIPTION, isAnyAdmin, type Role } from "@/payload/access/roles";

export const dynamic = "force-dynamic";

type User = {
  id: string | number;
  name?: string;
  email: string;
  role?: string;
  departments?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const ROLE_TONE: Record<Role, "navy" | "success" | "warning" | "neutral"> = {
  master_admin: "warning",
  admin: "navy",
  marketer: "success",
  hr: "success",
  procurement: "success",
  treasurer: "success",
  compliance: "success",
  network: "success",
  viewer: "neutral",
};

export default async function UsersPage() {
  const me = await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "users",
    limit: 200,
    depth: 0,
    sort: "name",
  });

  const users = result.docs.map((d) => d as unknown as User);

  // Group by their effective role (handles legacy editor+department mapping).
  const byRole = new Map<Role, User[]>();
  for (const u of users) {
    const r = effectiveRole(u);
    if (!byRole.has(r)) byRole.set(r, []);
    byRole.get(r)!.push(u);
  }

  const order: Role[] = [
    "master_admin",
    "admin",
    "marketer",
    "hr",
    "procurement",
    "treasurer",
    "compliance",
    "network",
    "viewer",
  ];

  const canInvite = isAnyAdmin(me);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Team</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <UsersIcon className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Team</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {users.length} member{users.length === 1 ? "" : "s"} · scoped by role to their department
            </p>
          </div>
        </div>
        {canInvite && (
          <Link
            href="/studio/users/new"
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Invite member
          </Link>
        )}
      </div>

      <div className="space-y-10">
        {order.map((r) => {
          const list = byRole.get(r) || [];
          if (list.length === 0) return null;
          return <RoleSection key={r} role={r} users={list} />;
        })}
      </div>
    </div>
  );
}

function RoleSection({ role, users }: { role: Role; users: User[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider inline-flex items-center gap-2">
            {role === "master_admin" && <Crown className="w-3.5 h-3.5 text-amber-600" />}
            {role === "admin" && <Shield className="w-3.5 h-3.5 text-cb-navy" />}
            {ROLE_LABEL[role]}
          </h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{ROLE_DESCRIPTION[role]}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{users.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map((u) => <UserCard key={String(u.id)} user={u} role={role} />)}
      </div>
    </section>
  );
}

function UserCard({ user, role }: { user: User; role: Role }) {
  return (
    <Link
      href={`/studio/users/${user.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-4 py-3.5 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <Avatar name={user.name || user.email} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-studio-ink group-hover:text-cb-navy transition-colors truncate">
          {user.name || user.email}
        </p>
        <p className="text-xs text-studio-ink-3 truncate">{user.email}</p>
      </div>
      <Badge tone={ROLE_TONE[role]}>
        {role === "master_admin" && <Crown className="w-3 h-3" />}
        {role === "admin" && <Shield className="w-3 h-3" />}
        {ROLE_LABEL[role]}
      </Badge>
    </Link>
  );
}
