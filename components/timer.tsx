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

export default function TimerComponent() {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(20);
  const [showControls, setShowControls] = useState(true);
  const supabase = getSupabaseClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedState = await loadTimerState();

        console.log({ savedState });
        if (savedState) {
          let adjustedTimeLeft = savedState.timeLeft;
          let adjustedIsRunning = savedState.isRunning || false;
          let adjustedShowControls =
            savedState.showControls !== undefined
              ? savedState.showControls
              : true;

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

              setTimeLeft(0);
              setIsRunning(false);
              setReminderInterval(savedState.reminderInterval || 20);
              setShowControls(true);
              setIsInitialized(true);

              await handleBreakLogged();
              return;
            }
          }

          setTimeLeft(adjustedTimeLeft);
          setIsRunning(adjustedIsRunning);
          setReminderInterval(savedState.reminderInterval || 20);
          setShowControls(adjustedShowControls);
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
      lastUpdated: Date.now(),
    };
    console.log({ state });
    saveTimerState(state).catch((e) =>
      console.error("Failed to save timer state:", e)
    );

    syncTimerStateWithServiceWorker(state).catch((e) =>
      console.error("Failed to sync with service worker:", e)
    );
  }, [timeLeft, isRunning, reminderInterval, showControls]);

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
        await supabase.from("break_logs").insert({
          user_id: profile.id,
          break_duration_minutes: reminderInterval,
          logged_at: new Date().toISOString(),
        });

        const exercises = (await import("@/lib/exercises.json")) as any;
        const randomExercise =
          exercises[Math.floor(Math.random() * exercises.length)];

        sendNotification("Eye Break Complete!", {
          body: `Great job! Your eyes have had a ${reminderInterval}-minute break. Time for "${randomExercise.title}" exercise!`,
          tag: "break-complete",
          data: {
            url: `/exercises/${randomExercise.id}`,
            exerciseId: randomExercise.id,
          },
        });

        await updateLastBreakTime();
        setTimeLeft(reminderInterval * 60);
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
    setShowControls(!isRunning);
    setIsRunning(!isRunning);
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setShowControls(true);
    setTimeLeft(reminderInterval * 60);
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
        await supabase.from("break_logs").insert({
          user_id: profile.id,
          break_duration_minutes: reminderInterval,
          logged_at: new Date().toISOString(),
        });

        // Get a random exercise for the notification
        const exercises = (await import("@/lib/exercises.json")) as Exercise[];
        const randomExercise = exercises[
          Math.floor(Math.random() * exercises.length)
        ] as Exercise;

        sendNotification("Break Logged!", {
          body: `Your ${reminderInterval}-minute break has been recorded. Try the "${randomExercise.title}" exercise!`,
          tag: "break-logged",
          data: {
            url: `/exercises/${randomExercise.id}`,
            exerciseId: randomExercise.id,
          },
        });

        await updateLastBreakTime();
        setTimeLeft(reminderInterval * 60);
      }
    } catch (error) {
      console.error("Error logging break:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-indigo-50 to-blue-100 border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold text-indigo-800">
          Focus Timer
        </CardTitle>
        <CardDescription className="text-center text-indigo-600">
          {isRunning
            ? `Stay focused on your ${reminderInterval}-minute break`
            : `Take a mindful ${reminderInterval}-minute break`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-8">
        {/* Main timer display - larger and more prominent */}
        <div className="relative">
          <div
            className={`text-8xl font-bold font-mono transition-all duration-300 ${
              timeLeft <= 60 ? "text-red-500 animate-pulse" : "text-indigo-700"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
            {isRunning ? "Remaining" : "Ready"}
          </div>
        </div>

        {/* Progress circle for visual feedback */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={
                283 -
                (283 * (reminderInterval * 60 - timeLeft)) /
                  (reminderInterval * 60)
              }
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>

        {/* Controls - hidden when timer is running */}
        {showControls && (
          <>
            <div className="flex gap-4 w-full justify-center">
              <Button
                onClick={toggleTimer}
                className="px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-700"
                variant={isRunning ? "destructive" : "default"}
              >
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="px-8 py-3 text-lg bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Reset
              </Button>
            </div>

            <Button
              onClick={logBreakManually}
              variant="secondary"
              className="w-full max-w-xs mx-auto bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              disabled={isLoading}
            >
              {isLoading ? "Logging..." : "Log Break Now"}
            </Button>

            <div className="w-full max-w-xs pt-6 border-t border-indigo-200">
              <label className="text-sm font-medium text-indigo-700 block mb-3 text-center">
                Break Duration: {reminderInterval} minutes
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
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-indigo-600 mt-1">
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
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700"
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
              className="px-6 py-2 bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              Stop
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
