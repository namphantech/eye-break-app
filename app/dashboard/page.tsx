"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { registerServiceWorker } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import NotificationPrompt from "@/components/notification-prompt";
import TimerComponent from "@/components/timer";
import DashboardStats from "@/components/dashboard-stats";
import BreakHistory from "@/components/break-history";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "history">("stats");
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setUser(session.user);
        await registerServiceWorker();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Eye Break</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationPrompt />

        <div className="flex flex-col items-center">
          {/* Centered Timer */}
          <div className="w-full max-w-2xl mb-8">
            <TimerComponent />
          </div>

          {/* Tab Navigation */}
          <div className="w-full max-w-2xl ">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "stats"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("stats")}
              >
                Statistics
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "history"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            </div>
            Tab Content
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === "stats" ? <DashboardStats /> : <BreakHistory />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
