import type { DishMeta, Snapshot } from ".";

const DB_NAME = "cell-simulation";
const DB_VERSION = 1;

/**
 * Metadata is stored apart from the snapshot so that listing dishes for the
 * menu doesn't pull several worlds' worth of grids into memory just to read
 * their names.
 */
const META_STORE = "dishes";
const SNAPSHOT_STORE = "snapshots";

let db: Promise<IDBDatabase> | undefined;

function open(): Promise<IDBDatabase> {
  if (db) return db;

  db = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) {
        database.createObjectStore(SNAPSHOT_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return db;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Writes both records in one transaction, so a dish never appears in the list
 * without a snapshot behind it.
 *
 * IndexedDB clones what it is given synchronously inside `put`, which is what
 * makes it safe to hand it the live grid and layers mid-run — the simulation
 * can't mutate them out from under the write.
 */
export async function saveDish(meta: DishMeta, snapshot: Snapshot) {
  const database = await open();
  const tx = database.transaction([META_STORE, SNAPSHOT_STORE], "readwrite");

  tx.objectStore(META_STORE).put(meta);
  tx.objectStore(SNAPSHOT_STORE).put(snapshot, meta.id);

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Every saved dish, most recently saved first.
 */
export async function listDishes(): Promise<DishMeta[]> {
  const database = await open();
  const store = database
    .transaction(META_STORE, "readonly")
    .objectStore(META_STORE);

  const dishes = await promisify(store.getAll() as IDBRequest<DishMeta[]>);

  return dishes.sort((a, b) => b.savedAt - a.savedAt);
}

export async function loadSnapshot(id: string): Promise<Snapshot | undefined> {
  const database = await open();
  const store = database
    .transaction(SNAPSHOT_STORE, "readonly")
    .objectStore(SNAPSHOT_STORE);

  return promisify(store.get(id) as IDBRequest<Snapshot | undefined>);
}

export async function deleteDish(id: string) {
  const database = await open();
  const tx = database.transaction([META_STORE, SNAPSHOT_STORE], "readwrite");

  tx.objectStore(META_STORE).delete(id);
  tx.objectStore(SNAPSHOT_STORE).delete(id);

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
