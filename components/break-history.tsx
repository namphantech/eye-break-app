"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BreakLog } from "@/lib/types";

export default function BreakHistory() {
  const [logs, setLogs] = useState<BreakLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .limit(1);

        if (!profiles || profiles.length === 0) {
          console.error("Profile not found for user:", user.id);
          return;
        }

        const profile = profiles[0];

        const { data } = await supabase
          .from("break_logs")
          .select("*")
          .eq("user_id", profile.id)
          .order("logged_at", { ascending: false })
          .limit(10);

        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [supabase]);

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Breaks</CardTitle>
        <CardDescription>Your last 10 logged breaks</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No breaks logged yet. Start your first break!
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">
                  {new Date(log.logged_at).toLocaleDateString()} at{" "}
                  {new Date(log.logged_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {log.break_duration_minutes}m
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
