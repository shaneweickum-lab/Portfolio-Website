import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = {
  title: { absolute: "Admin Login — W.P. Solutions" },
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="font-display text-2xl font-medium text-foreground">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage customers and communications.
          </p>

          <div className="mt-8">
            <AdminLogin />
          </div>
        </div>
      </div>
    </div>
  );
}
