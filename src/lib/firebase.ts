import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence internal Firestore SDK retry and backoff logs when free quota limit is reached
try {
  setLogLevel('silent');
} catch {
  // Ignore if not supported
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Connection test
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('resource-exhausted') || msg.includes('Quota limit exceeded')) {
      if (typeof window !== 'undefined') {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('gym_firestore_quota_exhausted_date', today);
      }
      console.warn("Firestore daily free quota limit reached for today.");
    } else if (msg.includes('the client is offline')) {
      console.warn("Firebase client offline warning:", error);
    }
  }
}
testFirestoreConnection();

export default app;
