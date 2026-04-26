"use client";

import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };
  return (
    <button
      onClick={logout}
      className="text-xs font-medium text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
    >
      Sign out
    </button>
  );
}
