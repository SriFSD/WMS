import { useEffect, useState } from "react";

const DB_NAME = "warehouse-management-db";
const STORE_NAME = "app_state";

let dbPromise;
let dbInstance;

function getDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
          dbPromise = null;
        };
        resolve(dbInstance);
      };
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
}

export function closePersistentDbConnection() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  dbPromise = null;
}

async function readValue(key) {
  const db = await getDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeValue(key, value) {
  const db = await getDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const storedValue = await readValue(key);
        if (isMounted && storedValue !== undefined) {
          setValue(storedValue);
        }
      } catch (error) {
        console.error(`Failed to load "${key}" from IndexedDB`, error);
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;

    writeValue(key, value).catch((error) => {
      console.error(`Failed to save "${key}" to IndexedDB`, error);
    });
  }, [key, value, hydrated]);

  return [value, setValue];
}
