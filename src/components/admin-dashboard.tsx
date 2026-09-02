"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Users, Mail, Clock } from "lucide-react";

interface Stats {
  waitlistCount: number;
  customerCount: number;
  communicationCount: number;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadData = async (token: string) => {
      try {
        const [statsRes, customersRes] = await Promise.all([
          fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !customersRes.ok) {
          localStorage.removeItem("adminToken");
          router.push("/admin");
          return;
        }

        const statsData = await statsRes.json();
        const customersData = await customersRes.json();

        setStats(statsData.stats);
        setCustomers(customersData.customers || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    loadData(token);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-foreground">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid gap-6 sm:grid-cols-3 mb-12">
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Waitlist Subscribers</p>
                  <p className="mt-2 text-3xl font-medium text-foreground">
                    {stats.waitlistCount}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-signal/40" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Customers</p>
                  <p className="mt-2 text-3xl font-medium text-foreground">
                    {stats.customerCount}
                  </p>
                </div>
                <Users className="h-8 w-8 text-signal/40" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Communications Sent</p>
                  <p className="mt-2 text-3xl font-medium text-foreground">
                    {stats.communicationCount}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-signal/40" />
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-4 font-display text-xl font-medium text-foreground">
            Recent Customers
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No customers yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border hover:bg-surface-muted/50"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal capitalize">
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
