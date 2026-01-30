/**
 * IndexedDB cache for templates, exercises, and goal templates
 *
 * Provides offline access to templates after initial online download.
 * Uses a version-based cache invalidation strategy.
 */

const DB_NAME = "gympepz_templates";
const DB_VERSION = 1;

// Store names
const TEMPLATES_STORE = "templates";
const EXERCISES_STORE = "exercises";
const GOAL_TEMPLATES_STORE = "goal_templates";
const META_STORE = "cache_meta";

// Types for cached data
export interface CachedTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  daysPerWeek: number;
  weeks: number | null;
  days: CachedTemplateDay[];
  cachedAt: number;
}

export interface CachedTemplateDay {
  id: string;
  label: string;
  day: number;
  order: number;
  isRestDay: boolean;
  items: CachedTemplateExercise[];
}

export interface CachedTemplateExercise {
  id: string;
  exerciseId: string | null;
  exerciseName: string | null; // Resolved name or fallback
  nameFallback: string | null;
  sets: number;
  reps: string;
  weight: string | null;
  order: number;
}

export interface CachedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  category: string | null;
  imageUrl: string | null;
  cachedAt: number;
}

export interface CachedGoalTemplate {
  id: string;
  name: string;
  description: string;
  goalType: string;
  unit: string | null;
  defaultTargetValue: number | null;
  defaultDurationWeeks: number | null;
  category: string | null;
  iconName: string | null;
  cachedAt: number;
}

export interface CacheMeta {
  key: string;
  version: string;
  lastUpdated: number;
  itemCount: number;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[TemplateCache] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Templates store
      if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
        const store = db.createObjectStore(TEMPLATES_STORE, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }

      // Exercises store
      if (!db.objectStoreNames.contains(EXERCISES_STORE)) {
        const store = db.createObjectStore(EXERCISES_STORE, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("muscleGroup", "muscleGroup", { unique: false });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }

      // Goal templates store
      if (!db.objectStoreNames.contains(GOAL_TEMPLATES_STORE)) {
        const store = db.createObjectStore(GOAL_TEMPLATES_STORE, { keyPath: "id" });
        store.createIndex("goalType", "goalType", { unique: false });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }

      // Meta store for version tracking
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
  });

  return dbPromise;
}

// ==================== Templates ====================

export async function cacheTemplates(templates: CachedTemplate[]): Promise<void> {
  const db = await openDatabase();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TEMPLATES_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(TEMPLATES_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Clear existing templates
    store.clear();

    // Add new templates
    for (const template of templates) {
      store.add({ ...template, cachedAt: now });
    }

    // Update meta
    metaStore.put({
      key: "templates",
      version: now.toString(),
      lastUpdated: now,
      itemCount: templates.length,
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCachedTemplates(): Promise<CachedTemplate[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TEMPLATES_STORE, "readonly");
    const store = transaction.objectStore(TEMPLATES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

export async function getCachedTemplate(id: string): Promise<CachedTemplate | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TEMPLATES_STORE, "readonly");
    const store = transaction.objectStore(TEMPLATES_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

// ==================== Exercises ====================

export async function cacheExercises(exercises: CachedExercise[]): Promise<void> {
  const db = await openDatabase();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXERCISES_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(EXERCISES_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Clear existing exercises
    store.clear();

    // Add new exercises
    for (const exercise of exercises) {
      store.add({ ...exercise, cachedAt: now });
    }

    // Update meta
    metaStore.put({
      key: "exercises",
      version: now.toString(),
      lastUpdated: now,
      itemCount: exercises.length,
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCachedExercises(): Promise<CachedExercise[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXERCISES_STORE, "readonly");
    const store = transaction.objectStore(EXERCISES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

export async function getCachedExercise(id: string): Promise<CachedExercise | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXERCISES_STORE, "readonly");
    const store = transaction.objectStore(EXERCISES_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

export async function searchCachedExercises(query: string): Promise<CachedExercise[]> {
  const exercises = await getCachedExercises();
  const lowerQuery = query.toLowerCase();

  return exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
      ex.equipment?.toLowerCase().includes(lowerQuery)
  );
}

// ==================== Goal Templates ====================

export async function cacheGoalTemplates(templates: CachedGoalTemplate[]): Promise<void> {
  const db = await openDatabase();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([GOAL_TEMPLATES_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(GOAL_TEMPLATES_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Clear existing
    store.clear();

    // Add new
    for (const template of templates) {
      store.add({ ...template, cachedAt: now });
    }

    // Update meta
    metaStore.put({
      key: "goal_templates",
      version: now.toString(),
      lastUpdated: now,
      itemCount: templates.length,
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCachedGoalTemplates(): Promise<CachedGoalTemplate[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOAL_TEMPLATES_STORE, "readonly");
    const store = transaction.objectStore(GOAL_TEMPLATES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

// ==================== Meta / Versioning ====================

export async function getCacheMeta(key: string): Promise<CacheMeta | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(META_STORE, "readonly");
    const store = transaction.objectStore(META_STORE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

export async function isCacheStale(
  key: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<boolean> {
  const meta = await getCacheMeta(key);
  if (!meta) return true;

  return Date.now() - meta.lastUpdated > maxAgeMs;
}

export async function hasCache(key: string): Promise<boolean> {
  const meta = await getCacheMeta(key);
  return meta !== null && meta.itemCount > 0;
}

export async function clearAllCaches(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [TEMPLATES_STORE, EXERCISES_STORE, GOAL_TEMPLATES_STORE, META_STORE],
      "readwrite"
    );

    transaction.objectStore(TEMPLATES_STORE).clear();
    transaction.objectStore(EXERCISES_STORE).clear();
    transaction.objectStore(GOAL_TEMPLATES_STORE).clear();
    transaction.objectStore(META_STORE).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ==================== Offline Status ====================

export async function getCacheStatus(): Promise<{
  templates: { count: number; lastUpdated: number | null };
  exercises: { count: number; lastUpdated: number | null };
  goalTemplates: { count: number; lastUpdated: number | null };
}> {
  const [templatesMeta, exercisesMeta, goalTemplatesMeta] = await Promise.all([
    getCacheMeta("templates"),
    getCacheMeta("exercises"),
    getCacheMeta("goal_templates"),
  ]);

  return {
    templates: {
      count: templatesMeta?.itemCount ?? 0,
      lastUpdated: templatesMeta?.lastUpdated ?? null,
    },
    exercises: {
      count: exercisesMeta?.itemCount ?? 0,
      lastUpdated: exercisesMeta?.lastUpdated ?? null,
    },
    goalTemplates: {
      count: goalTemplatesMeta?.itemCount ?? 0,
      lastUpdated: goalTemplatesMeta?.lastUpdated ?? null,
    },
  };
}
