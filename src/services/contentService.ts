import { db } from '../firebase';
import { Content, ContentType } from '../types';

/**
 * Generates a unique ID for the current week (ISO-8601)
 * Example: "2024-W52"
 */
export const getCurrentWeekID = (): string => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

/**
 * Increments view count with automatic weekly reset logic
 */
export const incrementViewCount = async (contentId: string) => {
    const currentWeek = getCurrentWeekID();
    const contentRef = db.collection('content').doc(contentId);

    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(contentRef);
            if (!doc.exists) return;

            const data = doc.data() as any;
            const storedWeek = data.trending_week;

            if (storedWeek === currentWeek) {
                // Same week: Simple increment
                transaction.update(contentRef, {
                    views_count: (data.views_count || 0) + 1
                });
            } else {
                // New week: Reset count to 1 and update week ID
                transaction.update(contentRef, {
                    views_count: 1,
                    trending_week: currentWeek
                });
            }
        });
    } catch (e) {
        console.error("Trending update failed", e);
    }
};

/**
 * Fetches the top trending content for the current week.
 * Optimized to work WITHOUT composite indexes by sorting in-memory.
 */
export const getTrendingContent = async (): Promise<Content[]> => {
    const currentWeek = getCurrentWeekID();
    
    try {
        const querySnap = await db.collection('content')
            .where('trending_week', '==', currentWeek)
            .get();

        if (querySnap.empty) {
            // Fallback: If no trending for this week yet, get top 10 general
            const fallbackSnap = await db.collection('content').limit(10).get();
            return fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
        }

        // Map and sort locally by views_count descending
        const allTrending = querySnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Content))
            .sort((a, b) => {
                const viewsA = (a as any).views_count || 0;
                const viewsB = (b as any).views_count || 0;
                return viewsB - viewsA;
            });

        // Filter and balance the results in memory (top 5 movies, top 5 series)
        const movies = allTrending.filter(item => item.type === ContentType.Movie).slice(0, 5);
        const series = allTrending.filter(item => item.type === ContentType.Series).slice(0, 5);

        // Combine them back and ensure final sorting
        const merged = [...movies, ...series].sort((a, b) => {
            const viewsA = (a as any).views_count || 0;
            const viewsB = (b as any).views_count || 0;
            return viewsB - viewsA;
        });

        return merged.slice(0, 10);
    } catch (error) {
        console.error("Error fetching trending content:", error);
        return [];
    }
};
