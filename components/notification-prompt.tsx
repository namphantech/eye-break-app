"use client"

import { useEffect, useState } from "react"
import { requestNotificationPermission } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are supported and not already granted
    if ("Notification" in window && Notification.permission === "default") {
      setIsVisible(true)
    }
  }, [])

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    const granted = await requestNotificationPermission()
    if (granted) {
      setIsVisible(false)
    }
    setIsLoading(false)
  }

  if (!isVisible) return null

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg">Enable Notifications</CardTitle>
        <CardDescription>Get reminders when it's time for an eye break</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={handleEnableNotifications} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Enabling..." : "Enable Notifications"}
        </Button>
        <Button onClick={() => setIsVisible(false)} variant="outline" disabled={isLoading}>
          Later
        </Button>
      </CardContent>
    </Card>
  )
}
