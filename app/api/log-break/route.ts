import { getSupabaseServer } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { break_duration_minutes } = await request.json();

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

    const { data, error } = await supabase
      .from("break_logs")
      .insert({
        user_id: profile.id,
        break_duration_minutes,
        logged_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error logging break:", error);
    return NextResponse.json({ error: "Failed to log break" }, { status: 500 });
  }
}
