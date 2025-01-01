// Sample gallery content for demonstration
const galleryContent = [
    {
        id: 1,
        title: "Summer Vibes",
        category: "new",
        thumbnail: "images/sample1.jpg",
        fullImage: "images/sample1-full.jpg",
        likes: "1.2k",
        views: "5.4k",
        date: "2 days ago",
        comments: 45,
        premium: false
    },
    {
        id: 2,
        title: "Exclusive Shoot",
        category: "premium",
        thumbnail: "images/premium1.jpg",
        fullImage: "images/premium1-full.jpg",
        likes: "2.5k",
        views: "8.7k",
        date: "1 day ago",
        comments: 89,
        premium: true
    },
    {
        id: 3,
        title: "Beach Paradise",
        category: "popular",
        thumbnail: "images/sample2.jpg",
        fullImage: "images/sample2-full.jpg",
        likes: "3.1k",
        views: "12.3k",
        date: "3 days ago",
        comments: 156,
        premium: false
    },
    // Add more gallery items here
];

// API endpoint simulation
async function fetchGalleryItems(page = 1, limit = 12) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const start = (page - 1) * limit;
    const end = start + limit;
    return galleryContent.slice(start, end);
}

// Gallery item template
function createGalleryItemTemplate(item) {
    return `
        <div class="gallery-item ${item.premium ? 'premium' : ''}" 
             data-category="${item.category}" 
             data-aos="fade-up">
            <div class="item-wrapper glass-card">
                ${item.premium ? `
                    <div class="premium-overlay">
                        <span class="premium-badge">
                            <i class="fas fa-crown"></i> VIP
                        </span>
                        <button class="unlock-btn magnetic-element">
                            Unlock Content
                        </button>
                    </div>
                ` : ''}
                
                <a href="${item.fullImage}" data-lightbox="gallery">
                    <img data-src="${item.thumbnail}" 
                         alt="${item.title}" 
                         class="lazy">
                    <div class="gallery-overlay">
                        <div class="overlay-content">
                            <div class="overlay-stats">
                                <span class="gallery-likes">
                                    <i class="fas fa-heart"></i> ${item.likes}
                                </span>
                                <span class="gallery-views">
                                    <i class="fas fa-eye"></i> ${item.views}
                                </span>
                            </div>
                            <div class="overlay-actions">
                                <button class="like-btn">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="share-btn">
                                    <i class="fas fa-share"></i>
                                </button>
                                <button class="save-btn">
                                    <i class="fas fa-bookmark"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </a>
                
                <div class="item-info">
                    <div class="item-header">
                        <h3>${item.title}</h3>
                        ${item.premium ? `
                            <span class="premium-tag">
                                <i class="fas fa-crown"></i>
                            </span>
                        ` : ''}
                    </div>
                    <div class="item-meta">
                        <div class="meta-left">
                            <span>
                                <i class="fas fa-calendar"></i> ${item.date}
                            </span>
                            <span>
                                <i class="fas fa-comment"></i> ${item.comments}
                            </span>
                        </div>
                        <div class="meta-right">
                            <button class="more-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export functions and data
export { galleryContent, fetchGalleryItems, createGalleryItemTemplate };

const contentSets = {
    featured: [
        {
            id: 'set001',
            title: 'Summer Vibes',
            description: 'Beachside photoshoot with sunset views',
            thumbnail: 'assets/thumbnails/summer-vibes-thumb.jpg',
            previewImages: ['preview1.jpg', 'preview2.jpg'],
            totalImages: 45,
            price: 14.99,
            type: 'photoset',
            tags: ['beach', 'sunset', 'outdoor'],
            rating: 'mild'
        },
        // Add more featured sets
    ],
    premium: [
        {
            id: 'set002',
            title: 'Private Collection',
            description: 'Exclusive indoor photoshoot',
            thumbnail: 'assets/thumbnails/private-collection-thumb.jpg',
            previewImages: ['preview1.jpg', 'preview2.jpg'],
            totalImages: 65,
            price: 24.99,
            type: 'photoset',
            tags: ['indoor', 'exclusive'],
            rating: 'spicy'
        },
        // Add more premium sets
    ]
};

const subscriptionTiers = {
    basic: {
        id: 'sub_basic',
        name: 'Fan Club',
        price: 9.99,
        period: 'monthly',
        features: [
            'Access to basic photo sets',
            'Behind the scenes content',
            'Early access to new posts',
            'Direct messaging'
        ],
        contentAccess: ['featured']
    },
    premium: {
        id: 'sub_premium',
        name: 'VIP Access',
        price: 24.99,
        period: 'monthly',
        features: [
            'All Fan Club benefits',
            'Full access to premium sets',
            'Exclusive live streams',
            'Priority support',
            'Custom requests'
        ],
        contentAccess: ['featured', 'premium']
    },
    diamond: {
        id: 'sub_diamond',
        name: 'Diamond Member',
        price: 49.99,
        period: 'monthly',
        features: [
            'All VIP benefits',
            'Personal photo set monthly',
            '1-on-1 video calls',
            'Premium Snapchat access',
            'Birthday surprise'
        ],
        contentAccess: ['featured', 'premium', 'exclusive']
    }
};

class ContentManager {
    constructor() {
        this.currentUser = null;
        this.stripe = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        // Initialize Stripe
        this.stripe = Stripe('your_publishable_key');
        this.initialized = true;
    }

    async login(credentials) {
        // Implement login logic
        // This should validate with your backend
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) throw new Error('Login failed');
            
            this.currentUser = await response.json();
            this.updateUI();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async purchaseSet(setId) {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return;
        }

        try {
            // Create a payment intent with your backend
            const response = await fetch('/api/payment/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    setId,
                    type: 'one-time'
                })
            });

            const data = await response.json();
            
            // Handle the payment with Stripe
            const result = await this.stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: this.currentUser.name
                    }
                }
            });

            if (result.error) {
                this.showError(result.error.message);
            } else {
                this.unlockContent(setId);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            this.showError('Purchase failed. Please try again.');
        }
    }

    async subscribe(tierId) {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return;
        }

        try {
            // Create a subscription with your backend
            const response = await fetch('/api/payment/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    tierId
                })
            });

            const data = await response.json();

            // Handle the subscription with Stripe
            const result = await this.stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: this.currentUser.name
                    }
                }
            });

            if (result.error) {
                this.showError(result.error.message);
            } else {
                this.updateSubscription(tierId);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            this.showError('Subscription failed. Please try again.');
        }
    }

    showLoginPrompt() {
        // Implement login modal display
        const modal = document.getElementById('login-modal');
        modal.style.display = 'flex';
    }

    showError(message) {
        // Implement error display
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    unlockContent(setId) {
        // Implement content unlocking logic
        const set = [...contentSets.featured, ...contentSets.premium]
            .find(set => set.id === setId);
        
        if (set) {
            // Update UI to show unlocked content
            this.updateUI();
            // Save unlocked status to user profile
            this.saveUnlockedContent(setId);
        }
    }

    async saveUnlockedContent(setId) {
        try {
            await fetch('/api/user/unlock-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    setId
                })
            });
        } catch (error) {
            console.error('Error saving unlocked content:', error);
        }
    }

    updateUI() {
        // Update the UI based on user's subscription and unlocked content
        this.renderGallery();
        this.updateSubscriptionStatus();
    }

    renderGallery() {
        const galleryElement = document.getElementById('gallery-grid');
        if (!galleryElement) return;

        const content = this.getAccessibleContent();
        
        galleryElement.innerHTML = content.map(set => this.createGalleryItem(set)).join('');
    }

    createGalleryItem(set) {
        return `
            <div class="gallery-item" data-id="${set.id}">
                <img src="${set.thumbnail}" alt="${set.title}">
                ${this.isUnlocked(set.id) ? '' : `
                    <div class="premium-marker">${this.getPriceDisplay(set)}</div>
                `}
                <div class="content-label">${set.rating}</div>
                <div class="gallery-overlay">
                    <h3>${set.title}</h3>
                    <p>${set.description}</p>
                    ${this.isUnlocked(set.id) ? `
                        <button class="primary-btn view-btn">View Now</button>
                    ` : `
                        <button class="primary-btn purchase-btn" data-id="${set.id}">
                            Unlock Now
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    getPriceDisplay(set) {
        return this.currentUser?.subscription ? 'Included' : `$${set.price}`;
    }

    isUnlocked(setId) {
        return this.currentUser?.unlockedContent?.includes(setId) || 
               this.hasSubscriptionAccess(setId);
    }

    hasSubscriptionAccess(setId) {
        if (!this.currentUser?.subscription) return false;
        
        const tier = subscriptionTiers[this.currentUser.subscription];
        const set = [...contentSets.featured, ...contentSets.premium]
            .find(set => set.id === setId);
            
        return tier.contentAccess.includes(set.type);
    }

    getAccessibleContent() {
        // Combine and filter content based on user's access
        return [...contentSets.featured, ...contentSets.premium].filter(set => 
            this.isUnlocked(set.id) || this.canPreview(set.id)
        );
    }

    canPreview(setId) {
        // Determine if user can see the content in gallery
        return true; // Always show in gallery, but lock actual access
    }

    updateSubscriptionStatus() {
        const statusElement = document.getElementById('subscription-status');
        if (!statusElement) return;

        if (!this.currentUser) {
            statusElement.innerHTML = `
                <div class="subscription-prompt">
                    <h3>Join the VIP Club</h3>
                    <p>Subscribe for exclusive access to all content</p>
                    <button class="primary-btn" onclick="contentManager.showSubscriptionOptions()">
                        View Plans
                    </button>
                </div>
            `;
            return;
        }

        const tier = subscriptionTiers[this.currentUser.subscription];
        if (tier) {
            statusElement.innerHTML = `
                <div class="subscription-active">
                    <h3>${tier.name}</h3>
                    <p>Active Subscription</p>
                    <button class="secondary-btn" onclick="contentManager.showAccountSettings()">
                        Manage Subscription
                    </button>
                </div>
            `;
        }
    }
}

// Initialize the content manager
const contentManager = new ContentManager();
contentManager.initialize();
