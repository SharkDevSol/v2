const DB_NAME = 'skoolific_sync';
const STORE = 'pending';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(method, url, body = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add({ method, url, body, createdAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dequeue() {
  const db = await openDB();
  const items = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const all = tx.objectStore(STORE).getAll();
    all.onsuccess = () => resolve(all.result);
    all.onerror = () => reject(all.error);
  });
  return items;
}

export async function remove(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function processQueue(apiClient) {
  const items = await dequeue();
  for (const item of items) {
    try {
      await apiClient({ method: item.method, url: item.url, data: item.body });
      await remove(item.id);
    } catch {
      // Will retry next time
    }
  }
}
