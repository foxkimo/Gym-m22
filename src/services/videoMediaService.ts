/**
 * Video Media Service for Exercise Custom Demonstration Videos
 * Supports Local File Uploads, IndexedDB Blob Caching, YouTube/Vimeo Parsing, and Camera Recording
 */

const DB_NAME = 'gym_m22_media_db';
const STORE_NAME = 'exercise_videos';
const DB_VERSION = 1;

class VideoMediaService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a local video file (Blob/File) for an exercise
   */
  public async saveLocalVideo(exerciseId: string, file: File | Blob): Promise<string> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        const record = {
          id: exerciseId,
          blob: file,
          type: file.type || 'video/mp4',
          name: (file as File).name || `exercise-${exerciseId}.mp4`,
          updatedAt: new Date().toISOString()
        };

        const req = store.put(record);
        req.onsuccess = () => {
          // Generate an Object URL
          const blobUrl = URL.createObjectURL(file);
          resolve(blobUrl);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Fallback to blob URL directly:', err);
      return URL.createObjectURL(file);
    }
  }

  /**
   * Retrieve video URL for an exercise from IndexedDB if stored locally
   */
  public async getVideoUrl(exerciseId: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(exerciseId);

        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            const blobUrl = URL.createObjectURL(req.result.blob);
            resolve(blobUrl);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Convert YouTube/Vimeo URLs to embeddable player links
   */
  public parseVideoSource(url: string | undefined): { 
    type: 'youtube' | 'vimeo' | 'direct' | 'none'; 
    embedUrl?: string; 
    rawUrl?: string;
  } {
    if (!url || !url.trim()) {
      return { type: 'none' };
    }

    const trimmed = url.trim();

    // YouTube formats: watch, youtu.be, shorts, embed
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
    );

    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&rel=0`,
        rawUrl: trimmed
      };
    }

    // Vimeo format
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`,
        rawUrl: trimmed
      };
    }

    return {
      type: 'direct',
      rawUrl: trimmed
    };
  }
}

export const videoMediaService = new VideoMediaService();
