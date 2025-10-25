"use client";

import { useParams, useRouter } from "next/navigation";
import exercises from "@/lib/exercises.json";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import Lottie from "lottie-react";
// import forestBlur from "@/public/animations/forest-blur.json";
export default function ExercisePage() {
  const { id } = useParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const exercise = exercises.find((e) => e.id === id);

  useEffect(() => {
    if (exercise) {
      setTimeLeft(exercise.duration);

      // // Play sound when entering the page
      // const audio = new Audio(`/sounds/${exercise.sound}`);
      // audio.play().catch((e) => console.log("Audio play failed:", e));
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
      // setTimeLeft(exercise.duration);

      // Play sound when entering the page
      const audio = new Audio(`/sounds/${exercise.sound}`);
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  const handleDone = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("👏 Tuyệt vời!", {
        body: "Bạn vừa giúp đôi mắt nghỉ ngơi!",
        icon: "/icons/smile.png",
        data: {
          url: `/dashboard`,
        },
      });
    }

    router.push("/");
  };

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
        <h1 className="text-2xl font-bold">Không tìm thấy bài tập</h1>
        <Button onClick={() => router.push("/")}>Quay về trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-6 p-4">
      <h1 className="text-3xl font-bold">{exercise.title}</h1>
      <p className="text-lg text-gray-600 max-w-md">{exercise.description}</p>

      {/* Countdown timer with circular progress */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Progress circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
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
              283 - (283 * (exercise.duration - timeLeft)) / exercise.duration
            }
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-mono font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* <div className="my-4">
        {exercise.animation && (
          <Lottie animationData={forestBlur} loop className="max-w-xs" />
        )}
      </div> */}

      {/* Controls */}
      <div className="flex gap-4 mt-4">
        {!isCounting && timeLeft === exercise.duration ? (
          <Button
            className="px-6 py-3 text-lg bg-green-500 hover:bg-green-600"
            onClick={handleStart}
          >
            Bắt đầu
          </Button>
        ) : (
          <>
            {timeLeft > 0 ? (
              <Button
                className="px-6 py-3 text-lg bg-yellow-500 hover:bg-yellow-600"
                onClick={() => setIsCounting(!isCounting)}
              >
                {isCounting ? "Tạm dừng" : "Tiếp tục"}
              </Button>
            ) : null}

            <Button
              className="px-6 py-3 text-lg bg-indigo-500 hover:bg-indigo-600"
              onClick={handleDone}
            >
              {timeLeft === 0 ? "Quay về làm việc" : "Xong rồi"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
