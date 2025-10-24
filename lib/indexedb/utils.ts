// Utility functions for IndexedDB data synchronization
import { openTimerDB } from "./timerStore";

/**
 * Send a message to the service worker with updated settings
 * @param {Object} settings - The settings to send to the service worker
 */
export const notifyServiceWorkerOfSettingsChange = (settings: any) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'settingsUpdated',
      settings: settings
    });
  }
};

/**
 * Synchronize timer state with service worker relevant data
 * @param {Object} timerState - The current timer state
 */
export const syncTimerStateWithServiceWorker = async (timerState: any) => {
  try {
    // Update settings in IndexedDB that the service worker needs
    const db = await openTimerDB();
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    
    // Update reminder interval
    if (timerState.reminderInterval) {
      store.put({
        key: "reminder-interval",
        value: timerState.reminderInterval
      });
    }
    
    // Update last updated time
    if (timerState.lastUpdated) {
      store.put({
        key: "last-updated",
        value: timerState.lastUpdated
      });
    }
    
    // Notify service worker of changes
    notifyServiceWorkerOfSettingsChange({
      reminderInterval: timerState.reminderInterval,
      lastUpdated: timerState.lastUpdated
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to sync timer state with service worker:", error);
  }
};

/**
 * Get service worker relevant settings from IndexedDB
 * @returns {Promise<Object>} Settings object with reminder interval and last break time
 */
export const getServiceWorkerSettings = async () => {
  try {
    const db = await openTimerDB();
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    
    const intervalReq = store.get("reminder-interval");
    const lastBreakReq = store.get("last-break-time");
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    return {
      reminderInterval: intervalReq.result?.value || 20,
      lastBreakTime: lastBreakReq.result?.value || Date.now()
    };
  } catch (error) {
    console.error("Failed to get service worker settings:", error);
    return {
      reminderInterval: 20,
      lastBreakTime: Date.now()
    };
  }
};