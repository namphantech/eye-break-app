export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if ("Notification" in window && Notification.permission === "granted") {
    return new Notification(title, {
      badge: "/icon-192.png",
      icon: "/icon-192.png",
      ...options,
    });
  }
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers are not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
      }
    );
    console.log("Service Worker registered successfully:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}
