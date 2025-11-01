"use client";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clearTimerState,
  loadTimerState,
  openTimerDB,
  saveTimerState,
} from "@/lib/indexedb/timerStore";
import { syncTimerStateWithServiceWorker } from "@/lib/indexedb/utils";
import { Exercise } from "@/lib/exerciseUtils";
import { playSoftNotificationSound } from "@/lib/sound";
import { useRouter } from "next/navigation";

export default function TimerComponent() {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(20);
  const [showControls, setShowControls] = useState(true);
  const [isBreakEnding, setIsBreakEnding] = useState(false);
  const [focusStartTime, setFocusStartTime] = useState<number | null>(null);
  const supabase = getSupabaseClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const savedState = await loadTimerState();
        if (savedState) {
          let adjustedTimeLeft = savedState.timeLeft;
          let adjustedIsRunning = savedState.isRunning || false;
          let adjustedShowControls =
            savedState.showControls !== undefined
              ? savedState.showControls
              : true;
          let adjustedFocusStartTime = savedState.focusStartTime || null;

          if (savedState.isRunning && savedState.lastUpdated) {
            const elapsedSeconds = Math.floor(
              (Date.now() - savedState.lastUpdated) / 1000
            );
            const newTimeLeft = Math.max(
              0,
              savedState.timeLeft - elapsedSeconds
            );
            adjustedTimeLeft = newTimeLeft;

            if (newTimeLeft === 0) {
              adjustedIsRunning = false;
              adjustedShowControls = true;
              adjustedFocusStartTime = null;

              setTimeLeft(0);
              setIsRunning(false);
              setReminderInterval(savedState.reminderInterval || 20);
              setShowControls(true);
              setFocusStartTime(null);
              setIsInitialized(true);

              await handleBreakLogged();
              return;
            }
          }

          setTimeLeft(adjustedTimeLeft);
          setIsRunning(adjustedIsRunning);
          setReminderInterval(savedState.reminderInterval || 20);
          setShowControls(adjustedShowControls);
          setFocusStartTime(adjustedFocusStartTime);
        }
      } catch (e) {
        console.error("Failed to load timer state:", e);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const state = {
      timeLeft,
      isRunning,
      reminderInterval,
      showControls,
      focusStartTime,
      lastUpdated: Date.now(),
    };

    saveTimerState(state).catch((e) =>
      console.error("Failed to save timer state:", e)
    );

    syncTimerStateWithServiceWorker(state).catch((e) =>
      console.error("Failed to sync with service worker:", e)
    );
  }, [timeLeft, isRunning, reminderInterval, showControls, focusStartTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      setShowControls(false);
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          if (newTime <= 0) {
            setIsRunning(false);
            setShowControls(true);
            setIsBreakEnding(true);

            playSoftNotificationSound();

            setTimeout(() => setIsBreakEnding(false), 10000);
            handleBreakLogged();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const updateLastBreakTime = async () => {
    const db = await openTimerDB();
    const tx = db.transaction("settings", "readwrite");
    tx.objectStore("settings").put({
      key: "last-break-time",
      value: Date.now(),
    });

    tx.objectStore("settings").put({
      key: "reminder-interval",
      value: reminderInterval,
    });
  };

  const handleBreakLogged = async () => {
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

      if (profiles?.length) {
        const profile = profiles[0];
        // Calculate focus duration in minutes
        const focusDurationMinutes = focusStartTime
          ? Math.floor((Date.now() - focusStartTime) / (1000 * 60))
          : reminderInterval;

        console.log({
          data: {
            user_id: profile.id,
            break_duration_minutes: focusDurationMinutes,
            focus_start_time: focusStartTime
              ? new Date(focusStartTime).toISOString()
              : null,
            logged_at: new Date().toISOString(),
          },
        });

        await supabase.from("break_logs").insert({
          user_id: profile.id,
          break_duration_minutes: focusDurationMinutes,
          focus_start_time: focusStartTime
            ? new Date(focusStartTime).toISOString()
            : null,
          logged_at: new Date().toISOString(),
        });

        const exercises = (await import("@/lib/exercises.json")) as any;
        const randomExercise =
          exercises[Math.floor(Math.random() * exercises.length)];

        sendNotification("Focus Session Complete!", {
          body: `Great job! You've focused for ${focusDurationMinutes} minutes. Time for "${randomExercise.title}" exercise!`,
          tag: "break-complete",
          data: {
            url: `/exercises/${randomExercise.id}`,
            exerciseId: randomExercise.id,
          },
        });

        await updateLastBreakTime();
        setTimeLeft(reminderInterval * 60);
        setFocusStartTime(null);

        router.push(`/exercises/${randomExercise.id}`);
      }
    } catch (error) {
      console.error("Error logging break:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      // When starting, record the start time
      setFocusStartTime(Date.now());
    }
    setShowControls(!isRunning);
    setIsRunning(!isRunning);
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setShowControls(true);
    setTimeLeft(reminderInterval * 60);
    setFocusStartTime(null);
    await clearTimerState();
  };

  const logBreakManually = async () => {
    setIsLoading(true);
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

      if (profiles?.length) {
        const profile = profiles[0];
        // Calculate focus duration in minutes
        const focusDurationMinutes = focusStartTime
          ? Math.floor((Date.now() - focusStartTime) / (1000 * 60))
          : reminderInterval;

        await supabase.from("break_logs").insert({
          user_id: profile.id,
          break_duration_minutes: focusDurationMinutes,
          focus_start_time: focusStartTime
            ? new Date(focusStartTime).toISOString()
            : null,
          logged_at: new Date().toISOString(),
        });

        // Get a random exercise for the notification
        const exercises = (await import("@/lib/exercises.json")) as Exercise[];
        const randomExercise = exercises[
          Math.floor(Math.random() * exercises.length)
        ] as Exercise;

        sendNotification("Focus Session Logged!", {
          body: `Your ${focusDurationMinutes}-minute focus session has been recorded. Try the "${randomExercise.title}" exercise!`,
          tag: "break-logged",
          data: {
            url: `/exercises/${randomExercise.id}`,
            exerciseId: randomExercise.id,
          },
        });

        await updateLastBreakTime();
        setTimeLeft(reminderInterval * 60);
        setFocusStartTime(null);
      }
    } catch (error) {
      console.error("Error logging break:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentage for animations
  const progressPercentage =
    ((reminderInterval * 60 - timeLeft) / (reminderInterval * 60)) * 100;
  const isLowTime = timeLeft <= 60 && timeLeft > 0;
  const isCriticalTime = timeLeft <= 10 && timeLeft > 0;

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-teal-50/80 to-cyan-50/80 shadow-none relative overflow-hidden backdrop-blur-sm border-none">
      {/* Soft blur background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-teal-100/20 backdrop-blur-[2px]"></div>

      {/* Animated background effect */}
      {isRunning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-200/20 to-transparent animate-pulse-slow"></div>
      )}

      {/* Break ending animation */}
      {isBreakEnding && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-300/10 to-emerald-400/10 animate-fadeInOut"></div>
      )}

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-center text-2xl font-bold text-gray-800">
          Focus Timer
        </CardTitle>
        <CardDescription className="text-center text-gray-500">
          {isRunning
            ? `Focusing for ${reminderInterval} minutes...`
            : `Focus for ${reminderInterval} minutes before your next break`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-8 relative z-10">
        {/* Main timer display - larger and more prominent with animations */}
        <div className="relative">
          <div
            className={`text-8xl font-bold font-mono transition-all duration-700 ease-out ${
              isCriticalTime
                ? "text-red-400 animate-pulse-fast"
                : isLowTime
                ? "text-orange-400 animate-pulse"
                : "text-teal-700"
            } ${isBreakEnding ? "animate-gentle-bounce" : ""}`}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
            {isRunning ? "Remaining" : "Ready"}
          </div>
        </div>

        {/* Progress circle for visual feedback with softer design */}
        <div className="relative w-48 h-48">
          {/* Background circle with soft blur */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(217, 242, 235, 0.5)"
              strokeWidth="6"
              className="backdrop-blur-sm"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={
                isCriticalTime ? "#F87171" : isLowTime ? "#FBBF24" : "#3BAE8A"
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="264"
              strokeDashoffset={
                264 -
                (264 * (reminderInterval * 60 - timeLeft)) /
                  (reminderInterval * 60)
              }
              transform="rotate(-90 50 50)"
              className={
                isRunning
                  ? "transition-all duration-1000 ease-out animate-pulse"
                  : "transition-all duration-700 ease-out"
              }
            />
          </svg>

          {/* Animated pulse indicator when running */}
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-2 border-teal-300/40 animate-ping-slow"></div>
          )}
        </div>

        {/* Controls - hidden when timer is running */}
        {showControls && (
          <>
            <div className="flex gap-4 w-full justify-center">
              <Button
                onClick={toggleTimer}
                className="px-8 py-3 text-lg bg-teal-600 hover:bg-teal-700 transition-all duration-500 ease-out hover:scale-105"
                variant={isRunning ? "destructive" : "default"}
              >
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="px-8 py-3 text-lg bg-white/80 border-teal-300 text-teal-700 hover:bg-teal-50/80 transition-all duration-500 ease-out hover:scale-105 backdrop-blur-sm"
              >
                Reset
              </Button>
            </div>

            <Button
              onClick={logBreakManually}
              variant="secondary"
              className="w-full max-w-xs mx-auto bg-white/80 border-teal-200 text-teal-700 hover:bg-teal-50/80 transition-all duration-500 ease-out hover:shadow-md backdrop-blur-sm"
              disabled={isLoading}
            >
              {isLoading ? "Logging..." : "Log Focus Session Now"}
            </Button>

            <div className="w-full max-w-xs pt-6 border-t border-teal-200/50">
              <label className="text-sm font-medium text-teal-700 block mb-3 text-center">
                You'll focus for {reminderInterval} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={reminderInterval}
                onChange={(e) => {
                  setReminderInterval(Number.parseInt(e.target.value));
                  setTimeLeft(Number.parseInt(e.target.value) * 60);
                  setIsRunning(false);
                }}
                className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer transition-all duration-300 hover:opacity-90"
              />
              <div className="flex justify-between text-xs text-teal-600 mt-1">
                <span>5m</span>
                <span>60m</span>
              </div>
            </div>
          </>
        )}

        {/* Minimal controls when timer is running */}
        {!showControls && (
          <div className="flex gap-4">
            <Button
              onClick={toggleTimer}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 transition-all duration-500 ease-out hover:scale-105"
              variant="default"
            >
              Pause
            </Button>
            <Button
              onClick={() => {
                setIsRunning(false);
                setShowControls(true);
              }}
              variant="outline"
              className="px-6 py-2 bg-white/80 border-teal-300 text-teal-700 hover:bg-teal-50/80 transition-all duration-500 ease-out hover:scale-105 backdrop-blur-sm"
            >
              Stop
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
