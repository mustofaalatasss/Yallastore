import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    console.error("SESSION IS NULL ON SERVER SIDE!");
    // TEMPORARILY DISABLED: redirect("/admin/login");
  } else {
    console.log("SESSION FOUND ON SERVER SIDE:", session.user.email);
  }
  return (
    <div className="min-h-screen dark:bg-[#050505] bg-white dark:text-white text-gray-900 font-sans selection:bg-primary selection:text-black">
      <AdminSidebar />
      <div className="flex flex-col min-h-screen">
        <AdminNavbar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

