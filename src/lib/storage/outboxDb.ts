/**
 * IndexedDB-based Outbox for offline-first sync
 *
 * This module provides durable storage for sync events that need to be
 * pushed to the server. Events persist across app restarts and are
 * automatically retried with exponential backoff.
 */

const DB_NAME = "gympepz_outbox";
const DB_VERSION = 1;

// Store names
const OUTBOX_STORE = "outbox_events";
const META_STORE = "sync_meta";

// Event types
export type OutboxEventType = "workout_logged" | "workout_updated" | "workout_deleted";

export type OutboxEventStatus = "pending" | "processing" | "acknowledged" | "failed";

export interface OutboxEvent<T = unknown> {
  id: string; // UUID - primary key
  eventType: OutboxEventType;
  userId: string;
  deviceId: string;
  payload: T;
  status: OutboxEventStatus;
  createdAt: number; // epoch ms
  processedAt?: number;
  acknowledgedAt?: number;
  failureReason?: string;
  retryCount: number;
  nextRetryAt?: number;
  batchId?: string;
}

export interface SyncMeta {
  userId: string;
  lastSyncedEventId?: string;
  lastSyncTimestamp?: number;
  pendingCount: number;
  failedCount: number;
}

// Workout payload structure (matches what server expects)
export interface WorkoutEventPayload {
  clientId: string; // Local ID for correlation
  date: string; // ISO
  startTime: string; // ISO
  endTime: string | null;
  completed: boolean;
  notes: string | null;
  programName?: string;
  programDayLabel?: string;
  sets: Array<{
    exerciseId: string;
    exerciseName?: string;
    setNumber: number;
    targetReps: number | null;
    actualReps: number;
    targetWeight: number | null;
    actualWeight: number | null;
    rpe: number | null;
    completed: boolean;
  }>;
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
      console.error("[OutboxDB] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection close
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create outbox_events store
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const outboxStore = db.createObjectStore(OUTBOX_STORE, { keyPath: "id" });

        // Indexes for efficient queries
        outboxStore.createIndex("status", "status", { unique: false });
        outboxStore.createIndex("userId", "userId", { unique: false });
        outboxStore.createIndex("status_userId", ["status", "userId"], { unique: false });
        outboxStore.createIndex("createdAt", "createdAt", { unique: false });
        outboxStore.createIndex("nextRetryAt", "nextRetryAt", { unique: false });
      }

      // Create sync_meta store
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "userId" });
      }
    };
  });

  return dbPromise;
}

/**
 * Generate a UUID for event IDs
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Add a new event to the outbox
 */
export async function addEvent<T>(
  eventType: OutboxEventType,
  userId: string,
  deviceId: string,
  payload: T
): Promise<OutboxEvent<T>> {
  const db = await openDatabase();

  const event: OutboxEvent<T> = {
    id: generateId(),
    eventType,
    userId,
    deviceId,
    payload,
    status: "pending",
    createdAt: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OUTBOX_STORE, META_STORE], "readwrite");
    const outboxStore = transaction.objectStore(OUTBOX_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Add the event
    const addRequest = outboxStore.add(event);

    addRequest.onerror = () => {
      console.error("[OutboxDB] Failed to add event:", addRequest.error);
      reject(addRequest.error);
    };

    // Update meta
    const metaRequest = metaStore.get(userId);
    metaRequest.onsuccess = () => {
      const meta: SyncMeta = metaRequest.result ?? {
        userId,
        pendingCount: 0,
        failedCount: 0,
      };
      meta.pendingCount += 1;
      metaStore.put(meta);
    };

    transaction.oncomplete = () => {
      // Dispatch event for listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("outbox-event-added", { detail: { eventId: event.id } })
        );
      }
      resolve(event);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

/**
 * Get all pending events for a user, optionally filtering by those ready to retry
 */
export async function getPendingEvents(
  userId: string,
  options?: { readyOnly?: boolean; limit?: number }
): Promise<OutboxEvent[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readonly");
    const store = transaction.objectStore(OUTBOX_STORE);
    const index = store.index("status_userId");

    const results: OutboxEvent[] = [];
    const now = Date.now();

    const request = index.openCursor(IDBKeyRange.only(["pending", userId]));

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }

      const event = cursor.value as OutboxEvent;

      // Filter by nextRetryAt if readyOnly
      if (options?.readyOnly && event.nextRetryAt && event.nextRetryAt > now) {
        cursor.continue();
        return;
      }

      results.push(event);

      // Check limit
      if (options?.limit && results.length >= options.limit) {
        resolve(results);
        return;
      }

      cursor.continue();
    };
  });
}

/**
 * Get failed events for a user
 */
export async function getFailedEvents(userId: string): Promise<OutboxEvent[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readonly");
    const store = transaction.objectStore(OUTBOX_STORE);
    const index = store.index("status_userId");

    const results: OutboxEvent[] = [];

    const request = index.openCursor(IDBKeyRange.only(["failed", userId]));

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }

      results.push(cursor.value as OutboxEvent);
      cursor.continue();
    };
  });
}

/**
 * Mark events as processing (being synced)
 */
export async function markProcessing(eventIds: string[]): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);

    for (const id of eventIds) {
      const request = store.get(id);
      request.onsuccess = () => {
        const event = request.result as OutboxEvent | undefined;
        if (event) {
          event.status = "processing";
          event.processedAt = Date.now();
          store.put(event);
        }
      };
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Mark events as acknowledged (successfully synced)
 */
export async function markAcknowledged(
  eventIds: string[],
  userId: string
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OUTBOX_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    let acknowledgedCount = 0;

    for (const id of eventIds) {
      const request = store.get(id);
      request.onsuccess = () => {
        const event = request.result as OutboxEvent | undefined;
        if (event && event.status !== "acknowledged") {
          event.status = "acknowledged";
          event.acknowledgedAt = Date.now();
          store.put(event);
          acknowledgedCount++;
        }
      };
    }

    // Update meta
    const metaRequest = metaStore.get(userId);
    metaRequest.onsuccess = () => {
      const meta: SyncMeta = metaRequest.result ?? {
        userId,
        pendingCount: 0,
        failedCount: 0,
      };
      meta.pendingCount = Math.max(0, meta.pendingCount - acknowledgedCount);
      meta.lastSyncTimestamp = Date.now();
      metaStore.put(meta);
    };

    transaction.oncomplete = () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("outbox-events-acknowledged"));
      }
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Mark events as failed with retry scheduling
 */
export async function markFailed(
  eventIds: string[],
  userId: string,
  reason: string
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OUTBOX_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    let failedCount = 0;

    for (const id of eventIds) {
      const request = store.get(id);
      request.onsuccess = () => {
        const event = request.result as OutboxEvent | undefined;
        if (event) {
          const wasNotFailed = event.status !== "failed";
          event.status = "failed";
          event.failureReason = reason;
          event.retryCount += 1;

          // Exponential backoff: 5s, 10s, 20s, 40s, 80s, max 5min
          const backoffMs = Math.min(5000 * Math.pow(2, event.retryCount - 1), 300000);
          event.nextRetryAt = Date.now() + backoffMs;

          store.put(event);

          if (wasNotFailed) {
            failedCount++;
          }
        }
      };
    }

    // Update meta
    const metaRequest = metaStore.get(userId);
    metaRequest.onsuccess = () => {
      const meta: SyncMeta = metaRequest.result ?? {
        userId,
        pendingCount: 0,
        failedCount: 0,
      };
      meta.failedCount += failedCount;
      metaStore.put(meta);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Retry failed events (move back to pending)
 */
export async function retryFailedEvents(
  eventIds: string[],
  userId: string
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OUTBOX_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    let retriedCount = 0;

    for (const id of eventIds) {
      const request = store.get(id);
      request.onsuccess = () => {
        const event = request.result as OutboxEvent | undefined;
        if (event && event.status === "failed") {
          event.status = "pending";
          event.nextRetryAt = undefined;
          event.failureReason = undefined;
          store.put(event);
          retriedCount++;
        }
      };
    }

    // Update meta
    const metaRequest = metaStore.get(userId);
    metaRequest.onsuccess = () => {
      const meta: SyncMeta = metaRequest.result ?? {
        userId,
        pendingCount: 0,
        failedCount: 0,
      };
      meta.pendingCount += retriedCount;
      meta.failedCount = Math.max(0, meta.failedCount - retriedCount);
      metaStore.put(meta);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Delete acknowledged events older than the specified age
 */
export async function cleanupAcknowledgedEvents(
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): Promise<number> {
  const db = await openDatabase();
  const cutoff = Date.now() - maxAgeMs;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);
    const index = store.index("status");

    let deletedCount = 0;

    const request = index.openCursor(IDBKeyRange.only("acknowledged"));

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(deletedCount);
        return;
      }

      const event = cursor.value as OutboxEvent;
      if (event.acknowledgedAt && event.acknowledgedAt < cutoff) {
        cursor.delete();
        deletedCount++;
      }

      cursor.continue();
    };
  });
}

/**
 * Get sync metadata for a user
 */
export async function getSyncMeta(userId: string): Promise<SyncMeta | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(META_STORE, "readonly");
    const store = transaction.objectStore(META_STORE);

    const request = store.get(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

/**
 * Get counts for UI display
 */
export async function getOutboxCounts(
  userId: string
): Promise<{ pending: number; failed: number; processing: number }> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readonly");
    const store = transaction.objectStore(OUTBOX_STORE);
    const index = store.index("userId");

    const counts = { pending: 0, failed: 0, processing: 0 };

    const request = index.openCursor(IDBKeyRange.only(userId));

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(counts);
        return;
      }

      const event = cursor.value as OutboxEvent;
      if (event.status === "pending") counts.pending++;
      else if (event.status === "failed") counts.failed++;
      else if (event.status === "processing") counts.processing++;

      cursor.continue();
    };
  });
}

/**
 * Check if there are any unsynced events
 */
export async function hasUnsyncedEvents(userId: string): Promise<boolean> {
  const counts = await getOutboxCounts(userId);
  return counts.pending > 0 || counts.processing > 0 || counts.failed > 0;
}

/**
 * Get an event by ID
 */
export async function getEvent(eventId: string): Promise<OutboxEvent | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, "readonly");
    const store = transaction.objectStore(OUTBOX_STORE);

    const request = store.get(eventId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

/**
 * Delete an event by ID
 */
export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OUTBOX_STORE, META_STORE], "readwrite");
    const store = transaction.objectStore(OUTBOX_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Get event first to update meta correctly
    const getRequest = store.get(eventId);
    getRequest.onsuccess = () => {
      const event = getRequest.result as OutboxEvent | undefined;
      if (event) {
        store.delete(eventId);

        // Update meta
        const metaRequest = metaStore.get(userId);
        metaRequest.onsuccess = () => {
          const meta: SyncMeta = metaRequest.result ?? {
            userId,
            pendingCount: 0,
            failedCount: 0,
          };
          if (event.status === "pending" || event.status === "processing") {
            meta.pendingCount = Math.max(0, meta.pendingCount - 1);
          } else if (event.status === "failed") {
            meta.failedCount = Math.max(0, meta.failedCount - 1);
          }
          metaStore.put(meta);
        };
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
