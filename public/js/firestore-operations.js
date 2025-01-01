import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp 
} from 'firebase/firestore';

// User Operations
export async function createUserProfile(userId, userData) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            subscription: {
                status: 'inactive',
                plan: 'free',
                expiresAt: null
            }
        });
        return true;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

export async function getUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

export async function updateUserProfile(userId, updateData) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Content Operations
export async function createContent(contentData) {
    try {
        const contentRef = collection(db, 'contentSets');
        const newContent = await addDoc(contentRef, {
            ...contentData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return newContent.id;
    } catch (error) {
        console.error('Error creating content:', error);
        throw error;
    }
}

export async function getContent(contentId) {
    try {
        const contentRef = doc(db, 'contentSets', contentId);
        const contentSnap = await getDoc(contentRef);
        if (contentSnap.exists()) {
            return contentSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting content:', error);
        throw error;
    }
}

export async function getAllPublicContent(limit = 10) {
    try {
        const contentRef = collection(db, 'contentSets');
        const q = query(
            contentRef,
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc'),
            limit(limit)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting public content:', error);
        throw error;
    }
}

// Subscription Operations
export async function updateUserSubscription(userId, subscriptionData) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscription: {
                ...subscriptionData,
                updatedAt: serverTimestamp()
            }
        });
        return true;
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
}

// Comments and Interactions
export async function addComment(contentId, userId, commentText) {
    try {
        const commentsRef = collection(db, 'contentSets', contentId, 'comments');
        await addDoc(commentsRef, {
            userId,
            text: commentText,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export async function getComments(contentId, limit = 20) {
    try {
        const commentsRef = collection(db, 'contentSets', contentId, 'comments');
        const q = query(
            commentsRef,
            orderBy('createdAt', 'desc'),
            limit(limit)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting comments:', error);
        throw error;
    }
}

// Analytics and Tracking
export async function trackUserAction(userId, action, metadata = {}) {
    try {
        const analyticsRef = collection(db, 'analytics');
        await addDoc(analyticsRef, {
            userId,
            action,
            metadata,
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error tracking user action:', error);
        throw error;
    }
}
