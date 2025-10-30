"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/dashboard-stats";
import BreakHistory from "@/components/break-history";
import ModernHeader from "@/components/modern-header";
import { ArrowLeft } from "lucide-react";

export default function ReportPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"statistics" | "history">(
    "statistics"
  );
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
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
      <ModernHeader user={user} onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Focus Report</h1>
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-border bg-background/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "statistics"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("statistics")}
          >
            Statistics
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "history"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
          {activeTab === "statistics" ? <DashboardStats /> : <BreakHistory />}
        </div>
      </main>
    </div>
  );
}
