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
import type { BreakStats } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardStats() {
  const [stats, setStats] = useState<BreakStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchStats = async () => {
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

        const { data: logs } = await supabase
          .from("break_logs")
          .select("*")
          .eq("user_id", profile.id)
          .order("logged_at", { ascending: false });

        if (!logs) {
          setStats({
            totalBreaks: 0,
            averageInterval: 0,
            longestStreak: 0,
            weeklyData: [],
          });
          return;
        }

        const totalBreaks = logs.length;
        const weeklyData = Array(7)
          .fill(0)
          .map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayStr = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const count = logs.filter((log: any) => {
              const logDate = new Date(log.logged_at);
              return logDate.toDateString() === date.toDateString();
            }).length;
            return { day: dayStr, breaks: count };
          });

        setStats({
          totalBreaks,
          averageInterval: totalBreaks > 0 ? Math.round(1440 / totalBreaks) : 0,
          longestStreak: 0,
          weeklyData,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="text-center text-gray-600">No data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Breaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalBreaks}
            </div>
            <p className="text-xs text-gray-500 mt-1">breaks logged</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.averageInterval}m
            </div>
            <p className="text-xs text-gray-500 mt-1">between breaks</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.longestStreak}d
            </div>
            <p className="text-xs text-gray-500 mt-1">consecutive days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Weekly Breaks</CardTitle>
          <CardDescription>Breaks logged this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="breaks" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
