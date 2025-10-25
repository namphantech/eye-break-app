"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceWorkerSettings } from "@/lib/indexedb/utils";
import { registerServiceWorker } from "@/lib/notifications";

export default function ReminderToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setInterval] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            const settings = await getServiceWorkerSettings();
            if (settings.reminderInterval) {
              setInterval(settings.reminderInterval);
              setIsEnabled(true);
            }
          } catch (error) {
            console.error("Failed to load settings from IndexedDB:", error);
            // Fallback to localStorage
          }
        }
      }
    };

    checkNotificationStatus();
  }, []);

  const handleTriggerReminder = async () => {
    // await registerServiceWorker();

    if (
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker.controller
    ) {
      setStatus("Service worker not available");
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // Send message to service worker to trigger a reminder
      navigator.serviceWorker.controller.postMessage({
        action: "scheduleNotifications",
        interval,
      });

      setStatus("Reminder triggered successfully!");
    } catch (error) {
      console.error("Failed to trigger reminder:", error);
      setStatus("Failed to trigger reminder");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-teal-200 bg-teal-50">
      <CardHeader>
        <CardTitle className="text-lg">Break Reminders</CardTitle>
        <CardDescription>
          Get periodic reminders to take eye breaks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Reminder Interval</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                max="120"
                value={interval}
                onChange={(e) =>
                  setInterval(parseInt(e.target.value, 10) || 30)
                }
                className="w-24"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-600">minutes</span>
            </div>
          </div>
          <Button
            onClick={handleTriggerReminder}
            disabled={isLoading}
            className="w-24 bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? "Triggering..." : "Trigger Now"}
          </Button>
        </div>

        {status && (
          <div
            className={`text-sm ${
              status.includes("Failed") ? "text-red-600" : "text-teal-600"
            }`}
          >
            {status}
          </div>
        )}

        <p className="text-xs text-gray-500">
          {isEnabled
            ? `You'll receive a reminder every ${interval} minutes.`
            : "Enable to receive periodic eye break reminders."}
        </p>
      </CardContent>
    </Card>
  );
}
