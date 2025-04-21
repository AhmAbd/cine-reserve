"use client";

import { usePathname } from "next/navigation";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      {!hideHeader && <AdminHeader />}
      <main className="p-6">{children}</main>
    </div>
  );
}
