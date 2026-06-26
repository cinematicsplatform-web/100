
// Modular SDK imports for advanced caching
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache,
  getFirestore
} from "firebase/firestore";

// Compatibility imports to support existing project logic
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/messaging";
import "firebase/compat/storage";

import type { Ad, SiteSettings, User, PinnedContentState, PinnedItem, PageKey, ContentRequest, HomeSection, Content, Top10State, Story, Notification, BroadcastNotification, Person, ReleaseSchedule, PromotionalBanner, GlobalServer, AutoLinkConfig } from '@/types';
import { initialSiteSettings, pinnedContentData as initialPinnedData, top10ContentData as initialTop10Data } from './data';
import { UserRole } from '@/types';

// Check if we are on the client or server to handle env vars correctly
const getEnvVar = (key: string, viteKey: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || process.env[viteKey];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  return undefined;
};

// Configuration for Cinematix
const firebaseConfig = {
  apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY") || "AIzaSyBVK0Zla5VD05Hgf4QqExAWUuXX64odyes", 
  authDomain: "cinematic-d3697.firebaseapp.com",
  projectId: "cinematic-d3697", 
  storageBucket: "cinematic-d3697.firebasestorage.app", 
  messagingSenderId: "247576999692",
  appId: "1:247576999692:web:309f001a211dc1b150fb29",
  measurementId: "G-XWRXYMGWRG"
};

// 1. Initialize Firebase Modular App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with a fallback to memory cache to prevent FILE_ERROR_NO_SPACE
let firestoreInstance;
try {
  firestoreInstance = getFirestore(app);
} catch (getErr) {
  try {
    firestoreInstance = initializeFirestore(app, {
      // Set a conservative cache size limit (10 MB instead of default 40 MB) 
      // to prevent hitting IndexDB space limits on user's browser
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 10485760 
      })
    });
  } catch (e) {
    console.warn("[Cinematix] Failed to initialize persistent cache, falling back to memory:", e);
    try {
      firestoreInstance = initializeFirestore(app, {
        localCache: memoryLocalCache()
      });
    } catch (e2) {
      firestoreInstance = getFirestore(app);
    }
  }
}

// 3. Setup Compat Layer for the rest of the application
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.app().storage();
export const auth = firebase.app().auth();

// Set explicit persistence to ensure it works across environments if possible
try {
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} catch (e) {
  console.warn("[Cinematix] Auth persistence could not be set:", e);
}

// Google Auth Provider for Social Login
export const googleProvider = new firebase.auth.GoogleAuthProvider();

// Additional Firestore Settings for compat layer
try {
  db.settings({
    ignoreUndefinedProperties: true,
    merge: true
  });
} catch (e: any) {
  if (!e.message.includes('already been initialized')) {
    console.warn("[Cinematix] Firestore settings error:", e.message);
  }
}

export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const Timestamp = firebase.firestore.Timestamp;

export let messaging: firebase.messaging.Messaging | null = null;

const initMessaging = async () => {
    if (typeof window !== 'undefined') {
        try {
            const supported = await firebase.messaging.isSupported();
            if (supported) {
                messaging = firebase.messaging();
            }
        } catch (e) {
            // SILENT
        }
    }
};

// Initialize messaging
initMessaging();

const safeGetTimestamp = (timestamp: any): string => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    return new Date().toISOString();
};

export const generateSlug = (title: string): string => {
    if (!title) return '';
    return title
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const handleFirestoreError = (error: any, context: string, fallback: any) => {
    const msg = error?.message || '';
    if (msg.toLowerCase().includes('index')) {
        console.error(`[Cinematix] Missing Index for ${context}.`);
        return fallback;
    }
    return fallback;
};

export const getPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
    try {
        const querySnapshot = await db.collection('promotionalBanners').get();
        const banners: PromotionalBanner[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isActive) {
                banners.push({ id: doc.id, ...data } as PromotionalBanner);
            }
        });
        return banners;
    } catch (error) {
        console.error("Error fetching promotional banners:", error);
        return [];
    }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const docSnap = await db.collection("settings").doc("site").get();
        if (docSnap.exists) {
            const data = docSnap.data() as Partial<SiteSettings>;
            return {
                ...initialSiteSettings,
                ...data,
                shoutBar: { ...initialSiteSettings.shoutBar, ...(data.shoutBar || {}) },
                socialLinks: { ...initialSiteSettings.socialLinks, ...(data.socialLinks || {}) }
            };
        } else {
            return initialSiteSettings;
        }
    } catch (error) {
        return handleFirestoreError(error, 'site settings', initialSiteSettings);
    }
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<void> => {
    await db.collection("settings").doc("site").set(settings, { merge: true });
};

export const getPinnedContent = async (): Promise<PinnedContentState> => {
    try {
        const docSnap = await db.collection("settings").doc("pinned").get();
        if (docSnap.exists) {
            return { ...initialPinnedData, ...docSnap.data() };
        }
        return initialPinnedData;
    } catch (error) {
        return handleFirestoreError(error, 'pinned content', initialPinnedData);
    }
};

export const updatePinnedContentForPage = async (pageKey: PageKey, items: PinnedItem[]): Promise<void> => {
    await db.collection("settings").doc("pinned").set({
        [pageKey]: items
    }, { merge: true });
};

export const getTop10Content = async (): Promise<Top10State> => {
    try {
        const docSnap = await db.collection("settings").doc("top10").get();
        if (docSnap.exists) {
            return { ...initialTop10Data, ...docSnap.data() };
        }
        return initialTop10Data;
    } catch (error) {
        return handleFirestoreError(error, 'top10 content', initialTop10Data);
    }
};

export const updateTop10ContentForPage = async (pageKey: PageKey, items: PinnedItem[]): Promise<void> => {
    await db.collection("settings").doc("top10").set({
        [pageKey]: items
    }, { merge: true });
};

export const getAds = async (): Promise<Ad[]> => {
    try {
        const querySnapshot = await db.collection("ads").orderBy("updatedAt", "desc").get();
        return querySnapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                placement: data.placement || data.position || 'home-top',
                type: data.type || 'code',
                status: data.status || (data.isActive === false ? 'disabled' : 'active'),
                isActive: data.status === 'active' || data.isActive === true,
                timerDuration: data.timerDuration || 0,
                updatedAt: safeGetTimestamp(data.updatedAt),
            };
        }) as Ad[];
    } catch (error) {
        return handleFirestoreError(error, 'ads', []);
    }
};

export const getAdByPosition = async (position: string): Promise<Ad | null> => {
  try {
    // Try matching by both placement and position fields to ensure backward compatibility
    let snap = await db.collection("ads")
        .where("placement", "==", position)
        .limit(5)
        .get();
    
    if (snap.empty) {
        snap = await db.collection("ads")
            .where("position", "==", position)
            .limit(5)
            .get();
    }

    if (!snap.empty) {
        // Find first active ad among results
        const activeDoc = snap.docs.find(d => {
            const data = d.data();
            return data.status === 'active' || data.isActive === true;
        }) || snap.docs[0];

        const data = activeDoc.data();
        return { 
            id: activeDoc.id, 
            ...data, 
            placement: data.placement || data.position || position,
            type: data.type || 'code',
            status: data.status || 'active',
            isActive: true
        } as Ad;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const addAd = async (adData: Omit<Ad, 'id' | 'updatedAt'>): Promise<string> => {
    const docRef = await db.collection("ads").add({ 
        ...adData, 
        position: adData.placement, 
        updatedAt: serverTimestamp() 
    });
    return docRef.id;
};

export const updateAd = async (adId: string, adData: Partial<Omit<Ad, 'id'>>): Promise<void> => {
    const data: any = { ...adData, updatedAt: serverTimestamp() };
    if (adData.placement) data.position = adData.placement;
    await db.collection("ads").doc(adId).update(data);
};

export const deleteAd = async (adId: string): Promise<void> => {
    await db.collection("ads").doc(adId).delete();
};

export const getAllContent = async (isAdmin: boolean = false): Promise<Content[]> => {
    try {
        const snapshot = await db.collection('content').get();
        const now = new Date();
        
        let contents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
        
        try {
            const serversList = await getServers();
            if (serversList.length > 0) {
                contents = resolveContentDynamicUrls(contents, serversList);
            }
        } catch (serverErr) {
            console.warn("Failed to resolve dynamic servers for content:", serverErr);
        }
        
        if (!isAdmin) {
            contents = contents.filter(c => {
                if (!c.isScheduled || !c.scheduledAt) return true;
                const scheduleDate = new Date(c.scheduledAt);
                return now >= scheduleDate;
            });
        }
        
        return contents;
    } catch (error) {
        return handleFirestoreError(error, 'content', []);
    }
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const querySnapshot = await db.collection("users").get();
        return querySnapshot.docs.map(d => ({
            ...(d.data() as Omit<User, 'id'>),
            id: d.id,
        }));
    } catch (error) {
        return handleFirestoreError(error, 'users', []);
    }
};

export const getUserProfile = async (uid: string): Promise<Omit<User, 'password'> | null> => {
    try {
        const docSnap = await db.collection("users").doc(uid).get();
        if (docSnap.exists) {
            return { ...(docSnap.data() as Omit<User, 'id'>), id: docSnap.id };
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const createUserProfileInFirestore = async (uid: string, data: Omit<User, 'id' | 'role' | 'password'>): Promise<void> => {
    await db.collection("users").doc(uid).set({ ...data, role: UserRole.User });
};

export const updateUserProfileInFirestore = async (userId: string, userData: Partial<User>): Promise<void> => {
    const dataToUpdate = { ...userData };
    delete (dataToUpdate as any).id;
    delete (dataToUpdate as any).password;
    await db.collection("users").doc(userId).update(dataToUpdate);
};

export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
    await db.collection("users").doc(userId).delete();
};

/**
 * دالة طلب الإذن بالإشعارات وتسجيل توكن الجهاز
 * تم تحديثها لتسجيل التوكن في مجموعة عامة لضمان وصول الإشعارات للجميع (زوار وأعضاء)
 */
export const requestNotificationPermission = async (userId?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
        const supported = await firebase.messaging.isSupported();
        if (!supported) return;
        
        if (!messaging) {
            messaging = firebase.messaging();
        }
        
        if (Notification.permission === 'denied') {
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const registration = await navigator.serviceWorker.ready;
            
            const token = await messaging.getToken({
                vapidKey: 'BHy3zaLsQsTzR23TNBbBRyVzz2OjySYt4k62K8TEOk0Wceez6uao-THJIzAaRzkSN7czJPLfMfaWfsbRt_rN9VQ',
                serviceWorkerRegistration: registration
            });
            
            if (token) {
                // 1. تسجيل التوكن في المجموعة العامة للإرسال الشامل (Global Push)
                await db.collection('fcm_tokens').doc(token).set({
                    token: token,
                    lastSeen: serverTimestamp(),
                    userId: userId || null,
                    device: navigator.userAgent
                }, { merge: true });

                // 2. إذا كان المستخدم مسجلاً، نربط التوكن بحسابه أيضاً
                if (userId) {
                    await db.collection('users').doc(userId).set({
                        fcmTokens: firebase.firestore.FieldValue.arrayUnion(token)
                    }, { merge: true });
                }
                
                console.log('[Cinematix] FCM Token successfully registered.');
            }
        } else {
            console.log('[Cinematix] Push Notification permission denied.');
        }
    } catch (error) {
        console.error('[Cinematix] FCM Token Request Error:', error);
    }
};

export const addContentRequest = async (request: Omit<ContentRequest, 'id' | 'createdAt' | 'status'>): Promise<void> => {
    const sanitizedData = {
        ...request,
        userId: request.userId || null,
        status: 'pending',
        createdAt: serverTimestamp()
    };
    await db.collection('requests').add(sanitizedData);
};

export const getContentRequests = async (): Promise<ContentRequest[]> => {
    try {
        const snapshot = await db.collection('requests').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: safeGetTimestamp(doc.data().createdAt)
        })) as ContentRequest[];
    } catch (e) {
        return [];
    }
};

export const deleteContentRequest = async (requestId: string): Promise<void> => {
    await db.collection('requests').doc(requestId).delete();
};

export const addReport = async (reportData: { 
    contentId: string;
    contentTitle: string;
    episode?: string;
    reason: string;
    description?: string;
}): Promise<void> => {
    await db.collection('reports').add({
        ...reportData,
        status: 'open',
        createdAt: serverTimestamp()
    });
};

export const getReports = async (): Promise<any[]> => {
    try {
        const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: safeGetTimestamp(doc.data().createdAt)
        }));
    } catch (e) {
        return [];
    }
};

export const deleteReport = async (reportId: string): Promise<void> => {
    await db.collection('reports').doc(reportId).delete();
};

export const getHomeSections = async (): Promise<HomeSection[]> => {
    try {
        const snapshot = await db.collection('home_sections').orderBy('positionIndex', 'asc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HomeSection[];
    } catch (e) {
        return handleFirestoreError(e, 'home sections', []);
    }
};

export const saveHomeSection = async (section: HomeSection): Promise<void> => {
    const { id, ...data } = section;
    const dataToSave = {
        ...data,
        updatedAt: serverTimestamp()
    };

    if (id) {
        await db.collection('home_sections').doc(id).update(dataToSave);
    } else {
        await db.collection('home_sections').add({
            ...dataToSave,
            createdAt: serverTimestamp()
        });
    }
};

export const deleteHomeSection = async (sectionId: string): Promise<void> => {
    await db.collection('home_sections').doc(sectionId).delete();
};

export const getPeople = async (): Promise<Person[]> => {
  try {
    const snapshot = await db.collection('people').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: safeGetTimestamp(doc.data().updatedAt)
    } as Person));
  } catch (error) {
    return handleFirestoreError(error, 'people', []);
  }
};

export const savePerson = async (person: Partial<Person>): Promise<string> => {
  const { id, ...data } = person;
  const dataToSave = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (id) {
    await db.collection('people').doc(id).update(dataToSave);
    return id;
  } else {
    const docRef = await db.collection('people').add({
      ...dataToSave,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
};

export const deletePerson = async (personId: string): Promise<void> => {
  await db.collection('people').doc(personId).delete();
};

export const getStories = async (onlyActive: boolean = true): Promise<Story[]> => {
    try {
        const snapshot = await db.collection('stories').get();
        let stories = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...(data as Omit<Story, 'id' | 'createdAt'>),
                createdAt: safeGetTimestamp(data.createdAt)
            } as Story;
        });
        stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (onlyActive) {
            stories = stories.filter(s => s.isActive);
        }
        return stories;
    } catch (e) {
        return handleFirestoreError(e, 'stories', []);
    }
};

export const saveStory = async (story: Partial<Story>): Promise<void> => {
    const { id, ...data } = story;
    const dataToSave = {
        ...data,
        createdAt: data.createdAt ? data.createdAt : serverTimestamp()
    };
    if (id) {
        await db.collection('stories').doc(id).update(dataToSave);
    } else {
        await db.collection('stories').add({
            ...dataToSave,
            createdAt: serverTimestamp()
        });
    }
};

export const deleteStory = async (storyId: string): Promise<void> => {
    await db.collection('stories').doc(storyId).delete();
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        let notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: safeGetTimestamp(doc.data().createdAt)
        } as Notification));
        notifications = notifications.filter(n => new Date(n.createdAt) > sevenDaysAgo);
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return notifications;
    } catch (error) {
        return handleFirestoreError(error, 'notifications', []);
    }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        await db.collection('notifications').doc(notificationId).update({ isRead: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

export const deleteUserNotification = async (notificationId: string): Promise<void> => {
    try {
        await db.collection('notifications').doc(notificationId).delete();
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    try {
        const unreadSnapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .get();
        const batch = db.batch();
        unreadSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

export const deleteAllUserNotifications = async (userId: string): Promise<void> => {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } catch (error) {
        console.error('Error deleting all notifications:', error);
    }
};

export const getBroadcastHistory = async (): Promise<BroadcastNotification[]> => {
    try {
        const snapshot = await db.collection('broadcast_history').orderBy('createdAt', 'desc').limit(20).get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: safeGetTimestamp(doc.data().createdAt)
        })) as BroadcastNotification[];
    } catch (e) {
        return [];
    }
};

export const deleteBroadcastNotification = async (broadcastId: string): Promise<void> => {
    try {
        await db.collection('broadcast_history').doc(broadcastId).delete();
        const userNotifs = await db.collection('notifications').where('broadcastId', '==', broadcastId).get();
        const batch = db.batch();
        userNotifs.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } catch (e) {
        console.error('Error deleting broadcast notification:', e);
    }
};

export const getReleaseSchedules = async (): Promise<ReleaseSchedule[]> => {
  try {
    const snapshot = await db.collection('release_radar').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReleaseSchedule));
  } catch (error) {
    return handleFirestoreError(error, 'release radar', []);
  }
};

export const saveReleaseSchedule = async (schedule: Partial<ReleaseSchedule>): Promise<void> => {
  const { id, ...data } = schedule;
  if (id) {
    await db.collection('release_radar').doc(id).update(data);
  } else {
    await db.collection('release_radar').add({
      ...data,
      lastAddedAt: null
    });
  }
};

export const deleteReleaseSchedule = async (id: string): Promise<void> => {
  await db.collection('release_radar').doc(id).delete();
};

export const markScheduleAsAdded = async (id: string): Promise<void> => {
  await db.collection('release_radar').doc(id).update({
    lastAddedAt: new Date().toISOString()
  });
};

// --- GET, ADD, UPDATE, DELETE SERVERS AND RESOLVE DYNAMIC URLS ---

export const getServers = async (): Promise<GlobalServer[]> => {
  try {
    const snapshot = await db.collection('servers').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GlobalServer));
  } catch (error) {
    return [];
  }
};

export const addServer = async (server: Omit<GlobalServer, 'id'>): Promise<string> => {
  const docRef = await db.collection('servers').add({
    ...server,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const updateServer = async (id: string, server: Partial<Omit<GlobalServer, 'id'>>): Promise<void> => {
  await db.collection('servers').doc(id).update(server);
};

export const deleteServer = async (id: string): Promise<void> => {
  await db.collection('servers').doc(id).delete();
};

const getCleanedSlug = (slug: string): string => {
    if (!slug) return '';
    if (slug.endsWith('/')) return slug;
    
    // Check if the slug ends with an episode prefix pattern or symbol
    const pattern = /[._\-\s/]([Ee]|[Ee][Pp]|[Hh])$/;
    const endsWithSeparator = /[._\-]$/;
    
    if (pattern.test(slug) || endsWithSeparator.test(slug)) {
        return slug;
    }
    return slug + '/';
};

export const resolveContentDynamicUrls = (contents: Content[], servers: GlobalServer[]): Content[] => {
    if (!servers || servers.length === 0) return contents;
    
    return contents.map(content => {
        // Find matching server if autoLinkConfig is used
        let preferredServer = content.autoLinkConfig?.serverId 
            ? servers.find(s => s.id === content.autoLinkConfig.serverId)
            : null;

        // Function to resolve any dynamic or static URL based on a global server, or fallbacks
        const resolveUrl = (originalUrl: string, serverIdFromConfig?: string): string => {
            if (!originalUrl || originalUrl.trim() === '') return originalUrl;
            if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) return originalUrl;
            
            try {
                const urlObj = new URL(originalUrl);
                const hostName = urlObj.hostname.toLowerCase();
                const externalDomains = [
                    'youtube.com', 'youtu.be', 'dailymotion.com', 'ok.ru', 
                    'vk.com', 'uqload', 'drive.google.com', 'vimeo.com',
                    'facebook.com', 'twitter.com', 'instagram.com'
                ];
                if (externalDomains.some(domain => hostName.includes(domain))) {
                    return originalUrl;
                }
                
                const pathName = urlObj.pathname;
                
                // Determine which server to use
                let matchedSrv = preferredServer;
                
                // If we have a specific server ID from the config, try to resolve it first
                if (serverIdFromConfig && (!matchedSrv || matchedSrv.id !== serverIdFromConfig)) {
                    matchedSrv = servers.find(s => s.id === serverIdFromConfig) || null;
                }
                
                // If still not matched, try matching by checking host of the original URL with baseDomain hosts
                if (!matchedSrv) {
                    matchedSrv = servers.find(s => {
                        try {
                            const sUrl = new URL(s.baseDomain);
                            return sUrl.host === urlObj.host;
                        } catch {
                            return s.baseDomain.includes(urlObj.host);
                        }
                    }) || null;
                }
                
                // Ultimate Fallback: Default to the first server in the list if no match can be established
                if (!matchedSrv) {
                    matchedSrv = servers[0];
                }
                
                if (matchedSrv) {
                    const baseDomain = matchedSrv.baseDomain || '';
                    const cleanBaseDomain = baseDomain.endsWith('/') ? baseDomain.slice(0, -1) : baseDomain;
                    const cleanPath = pathName.startsWith('/') ? pathName : '/' + pathName;
                    const searchParam = urlObj.search || '';
                    return cleanBaseDomain + cleanPath + searchParam;
                }
            } catch (err) {
                // Return fallback/original URL if parser fails
                return originalUrl;
            }
            return originalUrl;
        };

        // 1. Resolve movie/standalone direct servers at root level
        let updatedServers = content.servers;
        if (content.servers && content.servers.length > 0) {
            updatedServers = content.servers.map(server => {
                const updatedUrl = resolveUrl(server.url, content.autoLinkConfig?.serverId);
                const updatedDownloadUrl = server.downloadUrl 
                    ? resolveUrl(server.downloadUrl, content.autoLinkConfig?.serverId)
                    : updatedUrl;
                return {
                    ...server,
                    url: updatedUrl,
                    downloadUrl: updatedDownloadUrl
                };
            });
        }

        // 2. Resolve series, seasons, and episodes
        let updatedSeasons = content.seasons;
        if (content.seasons) {
            updatedSeasons = content.seasons.map(season => {
                if (!season.episodes) return season;
                
                const updatedEpisodes = season.episodes.map(episode => {
                    // Case A: Episode already has manual/static server URLs, resolve them dynamically applying current domain
                    if (episode.servers && episode.servers.length > 0) {
                        const updatedEpServers = episode.servers.map(server => {
                            const updatedUrl = resolveUrl(server.url, content.autoLinkConfig?.serverId);
                            const updatedDownloadUrl = server.downloadUrl 
                                ? resolveUrl(server.downloadUrl, content.autoLinkConfig?.serverId)
                                : updatedUrl;
                            return {
                                ...server,
                                url: updatedUrl,
                                downloadUrl: updatedDownloadUrl
                            };
                        });
                        
                        return {
                            ...episode,
                            servers: updatedEpServers
                        };
                    }
                    
                    // Case B: Generate the link dynamically from template metadata of autoLinkConfig (if present)
                    if (content.autoLinkConfig && content.autoLinkConfig.serverId) {
                        const matchedServer = servers.find(s => s.id === content.autoLinkConfig.serverId) || servers[0];
                        const baseDomain = matchedServer.baseDomain || '';
                        const slug = content.autoLinkConfig.seriesSlug || '';
                        const suffix = content.autoLinkConfig.suffix || '.mp4';
                        const padZero = content.autoLinkConfig.padZero;
                        const padTwoZeros = content.autoLinkConfig.padTwoZeros;

                        const extractEpisodeNumber = (title?: string): number => {
                            if (!title) return 0;
                            const match = title.match(/\d+/);
                            return match ? parseInt(match[0], 10) : 0;
                        };

                        const epNum = extractEpisodeNumber(episode.title);
                        if (epNum > 0) {
                            let numStr = `${epNum}`;
                            if (padTwoZeros) {
                                numStr = epNum < 10 ? `00${epNum}` : (epNum < 100 ? `0${epNum}` : `${epNum}`);
                            } else if (padZero) {
                                numStr = epNum < 10 ? `0${epNum}` : `${epNum}`;
                            }
                            
                            const cleanedSlug = getCleanedSlug(slug);
                            const cleanBaseDomain = baseDomain.endsWith('/') ? baseDomain.slice(0, -1) : baseDomain;
                            const dynamicUrl = `${cleanBaseDomain}/${cleanedSlug}${numStr}${suffix}`;
                            
                            const dynamicServer = {
                                id: 1, // Matches standard Server type id
                                name: matchedServer.name,
                                url: dynamicUrl,
                                downloadUrl: dynamicUrl,
                                isActive: true
                            };
                            
                            return {
                                ...episode,
                                servers: [dynamicServer]
                            };
                        }
                    }
                    return episode;
                });
                
                return {
                    ...season,
                    episodes: updatedEpisodes
                };
            });
        }
        
        return {
            ...content,
            servers: updatedServers,
            seasons: updatedSeasons
        };
    });
};

export const runDatabaseNormalizationMigration = async (serverId: string): Promise<{ successCount: number; failedCount: number }> => {
    let successCount = 0;
    let failedCount = 0;
    
    try {
        const snapshot = await db.collection('content').get();
        for (const doc of snapshot.docs) {
            const data = doc.data() as Content;
            let needsMigration = false;
            let seriesSlug = '';
            
            if (data.seasons) {
                for (const season of data.seasons) {
                    if (season.episodes) {
                        for (const ep of season.episodes) {
                            if (ep.servers) {
                                for (const s of ep.servers) {
                                    if (s.url && (s.url.startsWith('http://') || s.url.startsWith('https://'))) {
                                        try {
                                            const urlObj = new URL(s.url);
                                            const pathname = urlObj.pathname;
                                            const parts = pathname.split('/');
                                            if (parts.length > 2) {
                                                const slugParts = parts.slice(1, parts.length - 1);
                                                const candidateSlug = slugParts.join('/') + '/';
                                                if (candidateSlug && candidateSlug !== '/') {
                                                    seriesSlug = candidateSlug;
                                                    needsMigration = true;
                                                    break;
                                                }
                                            }
                                        } catch (urlErr) {
                                            // skip
                                        }
                                    }
                                }
                            }
                            if (needsMigration) break;
                        }
                    }
                    if (needsMigration) break;
                }
            }
            
            if (needsMigration && seriesSlug) {
                const autoLinkConfig = {
                    serverId,
                    seriesSlug,
                    suffix: '.mp4',
                    padZero: true,
                    padTwoZeros: false
                };
                
                await db.collection('content').doc(doc.id).update({
                    autoLinkConfig
                });
                successCount++;
            } else {
                failedCount++;
            }
        }
    } catch (err) {
        console.error("Migration error in firebase.ts:", err);
        throw err;
    }
    
    return { successCount, failedCount };
};

export const resolveSingleContentDynamicUrls = (content: Content, servers: GlobalServer[]): Content => {
    return resolveContentDynamicUrls([content], servers)[0];
};
