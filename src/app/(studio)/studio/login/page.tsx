import { redirect } from "next/navigation";
import { getStudioUser } from "@/lib/studio/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function StudioLogin() {
  const user = await getStudioUser();
  if (user) redirect("/studio");
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-xl bg-cb-navy text-white items-center justify-center font-bold text-xl mb-4">
            C
          </span>
          <h1 className="text-xl font-semibold text-studio-ink">CoopBank Studio</h1>
          <p className="text-sm text-studio-ink-3 mt-1">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
