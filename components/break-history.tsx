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
        <CardTitle>Recent Focus Sessions</CardTitle>
        <CardDescription>
          Your last 10 focus sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No focus sessions logged yet. Start your first focus session!
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      {log.break_duration_minutes} minutes focused
                    </div>
                    {log.focus_start_time && (
                      <div className="text-sm text-gray-600 mt-1">
                        Started: {new Date(log.focus_start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} on {new Date(log.focus_start_time).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Completed
                    </div>
                    <div className="text-sm font-medium text-teal-600">
                      {new Date(log.logged_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}