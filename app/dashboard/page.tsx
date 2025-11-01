"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { registerServiceWorker } from "@/lib/notifications";
import ModernHeader from "@/components/modern-header";
import TimerComponent from "@/components/timer";
import Image from "next/image";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 to-cyan-50/50 flex flex-col">
      <ModernHeader user={user} onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow ">
        <div className="flex flex-col items-center">
          {/* Centered Timer with more spacing */}
          <div className="w-full max-w-2xl mb-12">
            <TimerComponent />
          </div>

          {/* App description section - only shown when timer is not running */}

          <div className="w-full max-w-2xl mb-12">
            <div className="bg-[#F2F8F5]/90 dark:bg-[#0E1815]/90  backdrop-blur-sm rounded-xl p-6 shadow-sm animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-emerald-300 mb-4">
                🌿 What is Eylax?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>Eylax</strong> is a mindful focus companion that
                helps you maintain healthy screen habits. Inspired by the{" "}
                <span className="font-medium text-gray-800 dark:text-emerald-200">
                  Pomodoro Technique
                </span>
                , it encourages you to stay productive in focused intervals
                while taking regular eye breaks to rest and refresh your mind.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-emerald-300 mb-4">
                🍅 What is the Pomodoro Technique?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The Pomodoro Technique was created by{" "}
                <strong>Francesco Cirillo</strong>
                as a simple, effective way to manage time and focus. It uses a
                timer to divide work into short sessions — traditionally{" "}
                <strong>25 minutes</strong> — followed by short breaks. Each
                session is called a <em>pomodoro</em> (Italian for “tomato”),
                named after the tomato-shaped kitchen timer Cirillo used while
                studying.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-emerald-300 mb-4">
                👁️ Why use Eylax?
              </h2>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  Reduce eye strain caused by long hours in front of screens
                </li>
                <li>
                  Stay focused and productive through structured work intervals
                </li>
                <li>Build sustainable digital wellness habits over time</li>
                <li>Track your focus sessions and progress effortlessly</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-emerald-300 mb-4">
                ⏳ How does Eylax work?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Every 20 minutes, Eylax gently reminds you to rest your eyes
                and guides you through a short relaxation or eye exercise —
                keeping your vision and focus fresh throughout the day.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with copyright */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Eylax. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
