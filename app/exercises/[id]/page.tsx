"use client";

import { useParams, useRouter } from "next/navigation";
import exercises from "@/lib/exercises.json";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import forestBlur from "@/public/animations/forest-blur.json";
import ModernHeader from "@/components/modern-header";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ExercisePage() {
  const { id } = useParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = getSupabaseClient();

  const exercise = exercises.find((e) => e.id === id);

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
    };

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    if (exercise) {
      setTimeLeft(exercise.duration);
    }
  }, [exercise]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCounting && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsCounting(false);
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCounting, timeLeft]);

  const playCompletionSound = () => {
    if (exercise) {
      const audio = new Audio("/sounds/relax-success.mp3");
      audio.play().catch((e) => console.log("Completion sound failed:", e));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsCounting(true);
    if (exercise) {
      const audio = new Audio(`/sounds/${exercise.sound}`);
      audio.loop = true;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  const handleDone = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("👏 Great job!", {
        body: "You just helped your eyes rest!",
        data: {
          url: `/dashboard`,
        },
      });
    }

    router.push("/dashboard");
  };

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900/10 to-cyan-900/10">
        <ModernHeader user={user} onLogout={handleLogout} />
        <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Exercise not found
          </h1>
          <Button onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900/10 to-cyan-900/10">
      <ModernHeader user={user} onLogout={handleLogout} />

      <div className="flex flex-col items-center justify-center py-8 text-center gap-6 p-4">
        <h1 className="text-3xl font-bold text-foreground">{exercise.title}</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          {exercise.description}
        </p>

        {/* Animation */}
        {/* <div className="my-4">
          {exercise.animation && (
            <Lottie
              animationData={forestBlur}
              loop={true}
              className="max-w-xs"
            />
          )}
        </div> */}

        {/* Countdown timer with circular progress and effects */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background circle with soft blur */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(59, 174, 138, 0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={
                timeLeft <= 10 && timeLeft > 0
                  ? "#F87171"
                  : timeLeft <= 60 && timeLeft > 0
                  ? "#FBBF24"
                  : "#3BAE8A"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={
                283 - (283 * (exercise.duration - timeLeft)) / exercise.duration
              }
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Animated pulse indicator when running */}
          {isCounting && (
            <div className="absolute inset-0 rounded-full border-2 border-teal-300/40 animate-ping-slow"></div>
          )}

          {/* Timer text with animations */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-5xl font-bold font-mono transition-all duration-700 ease-out ${
                timeLeft <= 10 && timeLeft > 0
                  ? "text-red-400 animate-pulse-fast"
                  : timeLeft <= 60 && timeLeft > 0
                  ? "text-orange-400 animate-pulse"
                  : "text-teal-700"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Timer status text */}
        <div className="text-sm text-gray-500">
          {isCounting ? "Remaining" : "Ready"}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-4">
          {!isCounting && timeLeft === exercise.duration ? (
            <Button
              className="px-6 py-3 text-lg bg-teal-600 hover:bg-teal-700 transition-all duration-500 ease-out hover:scale-105"
              onClick={handleStart}
            >
              Start
            </Button>
          ) : (
            <>
              {timeLeft > 0 ? (
                <Button
                  className="px-6 py-3 text-lg bg-teal-600 hover:bg-teal-700 transition-all duration-500 ease-out hover:scale-105"
                  onClick={() => setIsCounting(!isCounting)}
                >
                  {isCounting ? "Pause" : "Continue"}
                </Button>
              ) : null}

              <Button
                className="px-6 py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleDone}
              >
                {timeLeft === 0 ? "Back to work" : "Done"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
