const CACHE_NAME = "eye-break-v1";
const urlsToCache = ["/", "/dashboard", "/offline.html"];

// Check if we're in development mode
const isDevelopment =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  event.waitUntil(initializeIndexedDB());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        return caches.match("/offline.html");
      })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-breaks") {
    event.waitUntil(syncBreaks());
  }
});

// Periodic background sync for notifications (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-break-reminder") {
    event.waitUntil(checkBreakReminder());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  if (event.action === "open") {
    event.waitUntil(clients.openWindow(url));
  } else if (event.action === "snooze") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientsArr) => {
        if (clientsArr[0]) {
          clientsArr[0].postMessage({ type: "SNOOZE_BREAK" });
        }
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ("focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || "Eye Break Reminder";
    const options = {
      body: data.body || "Time for an eye break!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "break-reminder",
      data: {
        url: data?.url,
      },
      requireInteraction: true,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

async function syncBreaks() {
  try {
    const db = await openDB();
    const breaks = await db.getAll("pending-breaks");

    for (const breakData of breaks) {
      await fetch("/api/log-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(breakData),
      });
      await db.delete("pending-breaks", breakData.id);
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

async function checkBreakReminder() {
  try {
    const db = await openDB();

    const reminderInterval = await new Promise((resolve) => {
      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const req = store.get("reminder-interval");

      req.onsuccess = () => {
        resolve(req.result ? Number(req.result.value) : 20); // default 20 phút
      };
      req.onerror = () => resolve(20);
    });

    const lastBreakTime = await new Promise((resolve) => {
      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const req = store.get("last-break-time");

      req.onsuccess = () => {
        resolve(req.result ? Number(req.result.value) : Date.now());
      };
      req.onerror = () => resolve(Date.now());
    });

    if (Date.now() - lastBreakTime > reminderInterval * 60 * 1000) {
      self.registration.showNotification("Time for an Eye Break!", {
        body: `You have been working for a while. Take a ${reminderInterval}-minute break to rest your eyes.`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "break-reminder",
        requireInteraction: true,
        data: {
          url: "/dashboard",
        },
      });
    }
  } catch (error) {
    console.error("Break reminder check failed:", error);
  }
}

async function getTimerState() {
  try {
    const db = await openDB();
    const tx = db.transaction("timerState", "readonly");
    const store = tx.objectStore("timerState");
    const req = store.get("eyeBreakTimer");

    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error("Failed to get timer state:", error);
    return null;
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("eye-break-db", 3);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-breaks")) {
        db.createObjectStore("pending-breaks", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains("timerState")) {
        db.createObjectStore("timerState", { keyPath: "id" });
      }
    };
  });
}

async function initializeIndexedDB() {
  try {
    const db = await openDB();
    const transaction = db.transaction(["settings"], "readwrite");
    const store = transaction.objectStore("settings");

    const intervalRequest = store.get("reminder-interval");
    intervalRequest.onsuccess = () => {
      if (!intervalRequest.result) {
        store.put({ key: "reminder-interval", value: 20 });
      }
    };

    const lastBreakRequest = store.get("last-break-time");
    lastBreakRequest.onsuccess = () => {
      if (!lastBreakRequest.result) {
        store.put({ key: "last-break-time", value: Date.now() });
      }
    };

    transaction.oncomplete = () => {
      console.log("IndexedDB initialized with default values");
    };
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "scheduleNotifications") {
    event.waitUntil(scheduleNotifications(event.data.interval));
  }

  if (event.data && event.data.action === "settingsUpdated") {
  }
});

async function scheduleNotifications(interval) {
  if ("periodicSync" in self.registration) {
    try {
      const db = await openDB();
      // await db.put("settings", { key: "reminder-interval", value: interval });

      // Register periodic sync
      await self.registration.periodicSync.register("check-break-reminder", {
        minInterval: interval * 60 * 1000, // Convert minutes to milliseconds
      });
      console.log(`Scheduled notifications every ${interval} minutes`);
    } catch (error) {
      console.error("Failed to schedule notifications:", error);
    }
  }
}
