import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { UserForm } from "@/components/studio/users/UserForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function UserEditPage({ params }: Args) {
  const me = await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <UserForm
        mode="create"
        currentRole={me.role}
        initial={{
          name: "",
          email: "",
          role: "viewer",
          departments: [],
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "users", id, depth: 0 });
  const u = result as unknown as {
    id: string | number;
    name?: string;
    email: string;
    role?: string;
    departments?: string[];
  };

  return (
    <UserForm
      mode="edit"
      currentRole={me.role}
      isSelf={me.id === u.id}
      initial={{
        id: u.id,
        name: u.name || "",
        email: u.email,
        role: u.role || "viewer",
        departments: u.departments || [],
      }}
    />
  );
}
