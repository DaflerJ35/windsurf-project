import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';

export class SubscriptionManager {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        this.stripe = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
        this.prices = {
            basic: 'price_basic',    // Replace with actual Stripe price IDs
            premium: 'price_premium',
            vip: 'price_vip'
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.subscribe-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const plan = e.target.dataset.plan;
                await this.handleSubscription(plan);
            });
        });

        // Portal button for existing subscribers
        const portalButton = document.getElementById('manage-subscription');
        if (portalButton) {
            portalButton.addEventListener('click', () => this.handleCustomerPortal());
        }
    }

    async handleSubscription(plan) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('Please sign in first');
            }

            const priceId = this.prices[plan];
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.uid,
                }),
            });

            const session = await response.json();
            window.location.href = session.url;
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async handleCustomerPortal() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('Please sign in first');
            }

            const userDoc = await getDoc(doc(this.db, 'users', user.uid));
            const customerId = userDoc.data()?.subscription?.customerId;

            if (!customerId) {
                throw new Error('No active subscription found');
            }

            const response = await fetch('/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                }),
            });

            const session = await response.json();
            window.location.href = session.url;
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async getSubscriptionStatus() {
        try {
            const user = this.auth.currentUser;
            if (!user) return null;

            const userDoc = await getDoc(doc(this.db, 'users', user.uid));
            return userDoc.data()?.subscription?.status || null;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
}

export default new SubscriptionManager();
