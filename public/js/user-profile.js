import { auth, storage } from './firebase-config.js';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateUserProfile, getUserProfile } from './firestore-operations.js';

export class UserProfileManager {
    constructor() {
        this.currentUser = auth.currentUser;
        this.setupListeners();
    }

    setupListeners() {
        // Listen for auth state changes
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserProfile();
            }
        });
    }

    async loadUserProfile() {
        try {
            const profile = await getUserProfile(this.currentUser.uid);
            this.updateProfileUI(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            throw error;
        }
    }

    updateProfileUI(profile) {
        // Update profile image
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.src = profile.photoURL || '/images/default-avatar.png';
        }

        // Update display name
        const displayNameElement = document.getElementById('displayName');
        if (displayNameElement) {
            displayNameElement.value = profile.displayName || '';
        }

        // Update other profile fields
        const bioElement = document.getElementById('userBio');
        if (bioElement) {
            bioElement.value = profile.bio || '';
        }

        // Update social links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const platform = link.getAttribute('data-platform');
            if (profile.socialLinks && profile.socialLinks[platform]) {
                link.value = profile.socialLinks[platform];
            }
        });
    }

    async updateProfile(formData) {
        try {
            const updates = {
                displayName: formData.get('displayName'),
                bio: formData.get('bio'),
                socialLinks: {
                    twitter: formData.get('twitter'),
                    instagram: formData.get('instagram'),
                    onlyfans: formData.get('onlyfans')
                },
                updatedAt: new Date()
            };

            // Update Firestore profile
            await updateUserProfile(this.currentUser.uid, updates);

            // Update Auth profile
            await updateProfile(this.currentUser, {
                displayName: updates.displayName
            });

            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async uploadProfileImage(file) {
        try {
            const storageRef = ref(storage, `profile-images/${this.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Auth profile
            await updateProfile(this.currentUser, {
                photoURL: downloadURL
            });

            // Update Firestore profile
            await updateUserProfile(this.currentUser.uid, {
                photoURL: downloadURL
            });

            return downloadURL;
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    }

    async updateNotificationPreferences(preferences) {
        try {
            await updateUserProfile(this.currentUser.uid, {
                notificationPreferences: preferences
            });
            return true;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }

    async updatePrivacySettings(settings) {
        try {
            await updateUserProfile(this.currentUser.uid, {
                privacySettings: settings
            });
            return true;
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            throw error;
        }
    }
}
