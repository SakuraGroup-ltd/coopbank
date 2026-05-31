"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Crown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { cn } from "../ui/cn";
import { ROLE_LABEL, ROLE_DESCRIPTION, type Role } from "@/payload/access/roles";

type Mode = "create" | "edit";

export type UserDraft = {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  departments: string[];
};

// Order matters — most-privileged first, most-scoped after.
const ALL_ROLES: Role[] = [
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

type SaveState = "idle" | "saving" | "saved" | "error";

export function UserForm({
  mode,
  currentRole,
  isSelf,
  initial,
}: {
  mode: Mode;
  currentRole?: string;
  isSelf?: boolean;
  initial: UserDraft;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<UserDraft>(initial);
  const [password, setPassword] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isMaster = currentRole === "master_admin";
  const isAdmin = currentRole === "admin" || isMaster;
  const canEditRole = isAdmin && !isSelf;
  const canEditEverything = isAdmin || isSelf;

  // Only master admins can mint other master admins.
  const availableRoles = ALL_ROLES.filter((r) => r !== "master_admin" || isMaster);

  function patch(partial: Partial<UserDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  async function save() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        name: draft.name,
        email: draft.email,
      };
      if (canEditRole) {
        body.role = draft.role;
        // Drop departments — new role model owns scope. Keep empty array so
        // existing rows don't carry orphaned values forward.
        body.departments = [];
      }
      if (password) {
        body.password = password;
      }
      const currentId = draft.id;
      const url = currentId ? `/api/users/${currentId}` : "/api/users";
      const method = currentId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setSaveState("error");
        setSaveError(txt || `HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (!currentId && data?.doc?.id) {
        window.history.replaceState(null, "", `/studio/users/${data.doc.id}`);
      }
      setSaveState("saved");
      setSavedAt(new Date());
      setPassword("");
      router.refresh();
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Network error");
    }
  }

  return (
    <div className="p-8 lg:p-10 max-w-[820px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/studio/users" className="hover:text-studio-ink">Team</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium truncate max-w-[280px]">
          {draft.name || draft.email || "New member"}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <Avatar name={draft.name || draft.email} size={56} />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Full name"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="block w-full text-2xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60"
            disabled={!canEditEverything}
          />
          <p className="text-sm text-studio-ink-3 mt-1">{draft.email || "no email"}</p>
        </div>
        {isSelf && <Badge tone="navy">You</Badge>}
      </div>

      {/* Basic identity */}
      <div className="space-y-6 rounded-2xl border border-studio-border bg-studio-panel p-6 mb-6">
        <Field label="Email">
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => patch({ email: e.target.value })}
            disabled={!canEditEverything}
          />
        </Field>

        <Field
          label={mode === "create" ? "Initial password" : "Reset password"}
          hint={mode === "edit" ? "Leave blank to keep current password" : undefined}
        >
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-ink-3" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "create" ? "Required" : "New password"}
              className="pl-9"
              disabled={!canEditEverything}
            />
          </div>
        </Field>
      </div>

      {/* Role picker */}
      <div className="rounded-2xl border border-studio-border bg-studio-panel p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-studio-ink">Role &amp; scope</h3>
          <p className="text-xs text-studio-ink-3 mt-1">
            {canEditRole
              ? "Pick what this person owns. Each role sees only its part of the Studio."
              : "Only admins can change roles."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableRoles.map((r) => {
            const on = draft.role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => canEditRole && patch({ role: r })}
                disabled={!canEditRole}
                className={cn(
                  "text-left p-3 rounded-xl border transition-colors",
                  on
                    ? "border-cb-navy bg-cb-navy/5 ring-1 ring-cb-navy/15"
                    : "border-studio-border bg-studio-panel hover:bg-studio-soft",
                  !canEditRole && "cursor-not-allowed opacity-60",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {r === "master_admin" && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                  {r === "admin" && <Shield className="w-3.5 h-3.5 text-cb-navy" />}
                  <span className={cn("text-sm font-semibold", on ? "text-studio-ink" : "text-studio-ink-2")}>
                    {ROLE_LABEL[r]}
                  </span>
                  {on && <CheckCircle2 className="w-3.5 h-3.5 text-cb-green ml-auto" />}
                </div>
                <p className="text-[11px] text-studio-ink-3 leading-relaxed">{ROLE_DESCRIPTION[r]}</p>
              </button>
            );
          })}
        </div>

        {draft.role === "master_admin" && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed inline-flex items-start gap-2">
              <Crown className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
              <span>
                <strong>Master Admin</strong> can delete users, change any other admin&apos;s role, and remove
                other master admins. Limit to one or two people.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6">
        {saveState === "error" && (
          <span className="text-xs text-rose-700 inline-flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            {saveError}
          </span>
        )}
        {saveState === "saved" && savedAt && (
          <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Saved
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={save}
            disabled={saveState === "saving" || !canEditEverything}
            className="h-10 px-5 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium disabled:opacity-50"
          >
            {saveState === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "create" ? "Create member" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-studio-ink-2 uppercase tracking-wider">{label}</span>
        {hint && <span className="text-[11px] text-studio-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
