"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { registerServiceWorker } from "@/lib/notifications";
import ModernHeader from "@/components/modern-header";
import TimerComponent from "@/components/timer";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        const currentUser = session.user;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", currentUser.id)
          .limit(1);

        if (!profiles || profiles.length === 0) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              email: currentUser.email,
            });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
          }
        }
        setUser(currentUser);
        // await registerServiceWorker();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 to-cyan-50/50 flex flex-col">
      <ModernHeader user={user} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col items-center">
          {/* Centered Timer with more spacing */}
          <div className="w-full max-w-3xl mb-12">
            <TimerComponent />
          </div>
        </div>
      </main>

      {/* Footer with copyright */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} LucidEye. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
