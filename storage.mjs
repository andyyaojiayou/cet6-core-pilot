import { createData, readBackup } from './session.mjs?v=10';

const database = 'cet6-vocabulary';
const previewDatabase = 'cet6-vocabulary-preview-g1-v5-20261105';
const storeName = 'learning';
const recordKey = 'device';
export const legacyKey = 'cet6-core-progress-v1';

export class StaleProgress extends Error {}

export function learningStoreForRelease(release) {
  if (release === 'production') return database;
  if (release === 'g2-preview') return 'cet6-vocabulary-preview-g2-20261105';
  return previewDatabase;
}

export async function openStore(release = globalThis.document?.documentElement.dataset.release) {
  const name = learningStoreForRelease(release);
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('请关闭其他词间标签页后重试'));
  });
  db.onversionchange = () => db.close();

  function transaction(transform) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      let result, failure;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure ?? tx.error ?? new Error('未能保存进度'));
      const request = store.get(recordKey);
      request.onsuccess = () => {
        try {
          const previous = request.result;
          result = transform(previous);
          if (result !== previous) store.put(result, recordKey);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    });
  }

  return {
    load: () => transaction(previous => {
      if (previous) {
        readBackup(JSON.stringify(previous.data));
        return previous;
      }
      const legacy = name === database ? localStorage.getItem(legacyKey) : null;
      return { revision: 0, data: legacy ? readBackup(legacy) : createData() };
    }),
    save: (data, revision) => transaction(previous => {
      if (revision !== null && previous?.revision !== revision) throw new StaleProgress();
      return { revision: (previous?.revision ?? -1) + 1, data };
    }),
  };
}
