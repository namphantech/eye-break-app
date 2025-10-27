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
import type { BreakLog, BreakStats } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "./ui/loading-spinner";

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

        const totalDuration = logs.reduce(
          (sum: number, log: BreakLog) => sum + log.break_duration_minutes,
          0
        );
        const averageDuration =
          totalBreaks > 0 ? Math.round(totalDuration / totalBreaks) : 0;

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

        const calculateStreaks = (logs: BreakLog[]) => {
          if (!logs || logs.length === 0) {
            return { longestStreak: 0, currentStreak: 0 };
          }

          const dateSet = new Set(
            logs.map(
              (log) => new Date(log.logged_at).toISOString().split("T")[0]
            )
          );

          const sortedDates = Array.from(dateSet)
            .map((d) => new Date(d))
            .sort((a, b) => a.getTime() - b.getTime());

          let longestStreak = 0;
          let streak = 1;
          let prevDate: Date | null = null;

          for (const date of sortedDates) {
            if (prevDate) {
              const diffDays =
                (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
              streak = diffDays === 1 ? streak + 1 : 1;
            }
            longestStreak = Math.max(longestStreak, streak);
            prevDate = date;
          }

          const today = new Date();
          let currentStreak = 0;
          for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const key = date.toISOString().split("T")[0];
            if (dateSet.has(key)) {
              currentStreak++;
            } else {
              break;
            }
          }

          return { longestStreak, currentStreak };
        };

        const { longestStreak } = calculateStreaks(logs as BreakLog[]);

        setStats({
          totalBreaks,
          averageInterval: averageDuration,
          longestStreak,
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
    return <LoadingSpinner />;
  }

  if (!stats) {
    return <div className="text-center text-gray-600">No data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-teal-50/80 hover:shadow-md transition-shadow border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Focus Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              {stats.totalBreaks}
            </div>
            <p className="text-xs text-gray-500 mt-1">sessions logged</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-50/80 hover:shadow-md transition-shadow border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">
              Avg. Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              {stats.averageInterval}m
            </div>
            <p className="text-xs text-gray-500 mt-1">per session</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-50/80 hover:shadow-md transition-shadow border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              {stats.longestStreak}d
            </div>
            <p className="text-xs text-gray-500 mt-1">consecutive days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-teal-50/80 border-0">
        <CardHeader>
          <CardTitle>Weekly Focus Sessions</CardTitle>
          <CardDescription>Focus sessions logged this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a3e4d7" />
              <XAxis dataKey="day" stroke="#2e8c70" />
              <YAxis stroke="#2e8c70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f2f8f5",
                  border: "1px solid #a3e4d7",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="breaks" fill="#3BAE8A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
