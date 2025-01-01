import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Function to handle auth state changes
export function initAuthState() {
    onAuthStateChanged(auth, (user) => {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        
        if (user) {
            // User is signed in
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                const userEmail = userInfo.querySelector('.user-email');
                if (userEmail) userEmail.textContent = user.email;
            }
        } else {
            // User is signed out
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    });
}

// Function to sign out
export async function handleSignOut() {
    try {
        await signOut(auth);
        window.location.href = '/auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
