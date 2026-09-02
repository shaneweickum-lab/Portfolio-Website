import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: { absolute: "Dashboard — Admin Portal" },
  robots: "noindex, nofollow",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
