// lib/indexedDb/timerStore.ts
export const openTimerDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("eye-break-db", 3);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("timerState")) {
        db.createObjectStore("timerState", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveTimerState = async (state: any) => {
  const db = await openTimerDB();
  const tx = db.transaction("timerState", "readwrite");
  const store = tx.objectStore("timerState");
  store.put({ id: "eyeBreakTimer", ...state });
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadTimerState = async () => {
  const db = await openTimerDB();
  const tx = db.transaction("timerState", "readonly");
  const store = tx.objectStore("timerState");
  const req = store.get("eyeBreakTimer");

  return new Promise<any>((resolve) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};

export const clearTimerState = async () => {
  const db = await openTimerDB();
  const tx = db.transaction("timerState", "readwrite");
  const store = tx.objectStore("timerState");
  store.delete("eyeBreakTimer");
  db.close();
};
