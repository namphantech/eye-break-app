import { getSupabaseServer } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .limit(1);

        if (!profiles || profiles.length === 0) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
            });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
            // Continue anyway as the user is authenticated
          }
        }
      }

      // Redirect to home page (as per project requirements) or the originally requested page
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to auth page with error message
  const redirectUrl = new URL("/auth", request.url);
  redirectUrl.searchParams.set("error", "auth_failed");
  return NextResponse.redirect(redirectUrl);
}
