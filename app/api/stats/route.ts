import { getSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .limit(1);

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    let profile;
    if (!profiles || profiles.length === 0) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
      });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      // Fetch the newly created profile
      const { data: newProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .limit(1);
      if (!newProfiles || newProfiles.length === 0) {
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }
      profile = newProfiles[0];
    } else {
      profile = profiles[0];
    }

    const { data: logs } = await supabase
      .from("break_logs")
      .select("*")
      .eq("user_id", profile.id)
      .order("logged_at", { ascending: false });

    if (!logs) {
      return NextResponse.json({
        totalBreaks: 0,
        averageInterval: 0,
        longestStreak: 0,
        weeklyData: [],
      });
    }

    const totalBreaks = logs.length;
    const weeklyData = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
        const count = logs.filter((log) => {
          const logDate = new Date(log.logged_at);
          return logDate.toDateString() === date.toDateString();
        }).length;
        return { day: dayStr, breaks: count };
      });

    return NextResponse.json({
      totalBreaks,
      averageInterval: totalBreaks > 0 ? Math.round(1440 / totalBreaks) : 0,
      longestStreak: 0,
      weeklyData,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
