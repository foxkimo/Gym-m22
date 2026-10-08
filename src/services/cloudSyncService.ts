import { 
  doc, 
  setDoc, 
  collection,
  onSnapshot, 
  serverTimestamp,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StorageService } from './storageService';

const COLLECTION_NAME = 'gym_m22_state';

// Keys that should not be sent or are too large/local-only
const LOCAL_ONLY_KEYS = new Set([
  'gym_m22_theme',
  'gym_m22_current_user'
]);

class CloudSyncService {
  private unsubscribe: Unsubscribe | null = null;
  private pendingKeySyncs: Set<string> = new Set();
  private isApplyingRemoteUpdate = false;
  private syncTimer: any = null;
  private listeners: Set<() => void> = new Set();
  private isConnected = false;

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in cloud sync listener:', err);
      }
    });
  }

  public init() {
    if (this.unsubscribe) return;

    try {
      const colRef = collection(db, COLLECTION_NAME);

      // Listen to all individual key documents in the collection
      this.unsubscribe = onSnapshot(colRef, (snapshot) => {
        this.isConnected = true;
        let hasChanges = false;

        snapshot.docChanges().forEach(change => {
          const key = change.doc.id;
          if (!key || LOCAL_ONLY_KEYS.has(key)) return;

          const data = change.doc.data();
          if (!data || typeof data.payload !== 'string') return;

          const currentLocal = StorageService.getRawKey(key);
          if (currentLocal !== data.payload) {
            this.isApplyingRemoteUpdate = true;
            StorageService.setRawKey(key, data.payload);
            this.isApplyingRemoteUpdate = false;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          this.notifyListeners();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gym_permissions_updated'));
          }
        }

        // On first run, check if any essential local keys are missing from cloud
        if (snapshot.empty) {
          this.syncAllLocalKeysToCloud();
        }
      }, (error) => {
        console.warn('Firestore real-time collection sync listener error:', error);
        this.isConnected = false;
      });

      // Listen to single key storage changes
      if (typeof window !== 'undefined') {
        window.addEventListener('gym_storage_updated', (event: any) => {
          if (this.isApplyingRemoteUpdate) return;
          const key = event?.detail?.key;
          if (key && !LOCAL_ONLY_KEYS.has(key)) {
            this.queueKeySync(key);
          }
        });
      }

    } catch (err) {
      console.error('Failed to initialize CloudSyncService:', err);
    }
  }

  private isQuotaExhaustedToday(): boolean {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('gym_firestore_quota_exhausted_date') === today;
  }

  private setQuotaExhaustedToday() {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('gym_firestore_quota_exhausted_date', today);
    }
  }

  private queueKeySync(key: string) {
    if (LOCAL_ONLY_KEYS.has(key) || this.isQuotaExhaustedToday()) return;
    this.pendingKeySyncs.add(key);

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.flushPendingSyncs();
    }, 1500);
  }

  private optimizePayloadForKey(key: string, rawPayload: string): string {
    if (!rawPayload || rawPayload.length < 350000) {
      return rawPayload;
    }

    try {
      const parsed = JSON.parse(rawPayload);
      if (Array.isArray(parsed)) {
        let sliced = parsed.slice(0, 30);
        let serialized = JSON.stringify(sliced);
        while (serialized.length > 350000 && sliced.length > 5) {
          sliced = sliced.slice(0, Math.floor(sliced.length * 0.7));
          serialized = JSON.stringify(sliced);
        }
        StorageService.setRawKey(key, serialized);
        return serialized;
      }
    } catch {
      if (rawPayload.length > 500000) {
        return rawPayload.substring(0, 500000);
      }
    }
    return rawPayload;
  }

  private async flushPendingSyncs() {
    if (this.pendingKeySyncs.size === 0 || this.isQuotaExhaustedToday()) return;
    const keysToSync = Array.from(this.pendingKeySyncs);
    this.pendingKeySyncs.clear();

    for (const key of keysToSync) {
      try {
        let payload = StorageService.getRawKey(key);
        if (payload !== null) {
          payload = this.optimizePayloadForKey(key, payload);
          const docRef = doc(db, COLLECTION_NAME, key);
          await setDoc(docRef, {
            payload,
            updatedAt: serverTimestamp(),
            key
          }, { merge: true });
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded') || errMsg.includes('quota metric')) {
          console.warn('Firestore write quota reached for today. Remote sync paused; local data is securely preserved.');
          this.setQuotaExhaustedToday();
          // Put remaining keys back into pending
          keysToSync.forEach(k => this.pendingKeySyncs.add(k));
          break;
        } else {
          console.warn(`Could not sync key "${key}" to Firestore:`, err);
        }
      }
    }
  }

  public async syncAllLocalKeysToCloud() {
    if (this.isQuotaExhaustedToday()) return;
    const allKeys = StorageService.getAllGymKeys();
    for (const key of allKeys) {
      if (!LOCAL_ONLY_KEYS.has(key)) {
        this.queueKeySync(key);
      }
    }
  }

  public getStatus(): { connected: boolean; quotaExhausted: boolean } {
    return { 
      connected: this.isConnected,
      quotaExhausted: this.isQuotaExhaustedToday()
    };
  }
}

export const cloudSyncService = new CloudSyncService();
