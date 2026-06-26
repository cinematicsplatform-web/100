import { db, serverTimestamp } from './firebase';
import firebase from 'firebase/compat/app';

/**
 * Logs a search query to Firestore to track user interest.
 */
export const logSearchQuery = async (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || normalized.length < 2) return;

    try {
        const searchRef = db.collection('analytics_search').doc(normalized);
        await searchRef.set({
            query: normalized,
            count: firebase.firestore.FieldValue.increment(1),
            lastSearched: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Analytics: Failed to log search query", e);
    }
};

/**
 * Logs a watch session duration.
 */
export const logWatchSession = async (durationSeconds: number) => {
    if (durationSeconds <= 0) return;

    try {
        const sessionRef = db.collection('analytics_sessions').doc();
        await sessionRef.set({
            duration: durationSeconds,
            timestamp: serverTimestamp()
        });
        
        // Also update a global counter for easy aggregation
        const statsRef = db.collection('analytics_global').doc('watch_stats');
        await statsRef.set({
            totalSeconds: firebase.firestore.FieldValue.increment(durationSeconds),
            totalSessions: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (e) {
        console.error("Analytics: Failed to log watch session", e);
    }
};

/**
 * Detects device type and logs the visit.
 */
export const logDeviceVisit = async () => {
    // Only log once per session to avoid noise
    const sessionLogged = sessionStorage.getItem('cinematix_visit_logged');
    if (sessionLogged) return;

    const userAgent = navigator.userAgent;
    let device = 'Desktop';

    if (/SmartTV|Tizen|WebOS|AppleTV|HbbTV/i.test(userAgent)) {
        device = 'Smart TV';
    } else if (/Tablet|iPad|PlayBook/i.test(userAgent)) {
        device = 'Tablet';
    } else if (/Mobi|Android|iPhone/i.test(userAgent)) {
        device = 'Mobile';
    }

    try {
        const deviceRef = db.collection('analytics_devices').doc(device);
        await deviceRef.set({
            deviceType: device,
            count: firebase.firestore.FieldValue.increment(1),
            lastVisit: serverTimestamp()
        }, { merge: true });
        
        sessionStorage.setItem('cinematix_visit_logged', 'true');
    } catch (e) {
        console.error("Analytics: Failed to log device visit", e);
    }
};
