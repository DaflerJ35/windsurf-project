// Initialize features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Initialize Lightbox
    if (typeof $ !== 'undefined') {
        $(document).on('click', '[data-toggle="lightbox"]', function(event) {
            event.preventDefault();
            $(this).ekkoLightbox({
                alwaysShowClose: true,
                showArrows: true,
                wrapping: true
            });
        });
    }

    // Initialize Lazy Loading
    if (typeof LazyLoad !== 'undefined') {
        const lazyLoadInstance = new LazyLoad({
            elements_selector: ".lazy",
            load_delay: 300,
            threshold: 0,
            callback_loaded: (el) => {
                el.parentElement.classList.add('loaded');
            }
        });
    }

    // Gallery Filter Functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Add fade in animation
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 100);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Premium Content Interaction
    const unlockButtons = document.querySelectorAll('.unlock-btn');
    unlockButtons.forEach(button => {
        button.addEventListener('click', () => {
            const premiumModal = document.createElement('div');
            premiumModal.className = 'premium-modal';
            premiumModal.innerHTML = `
                <div class="premium-modal-content">
                    <h2>🔒 Unlock Premium Content</h2>
                    <p>Get unlimited access to exclusive content with VIP membership!</p>
                    <div class="premium-tiers">
                        <div class="premium-tier">
                            <h3>Monthly VIP</h3>
                            <p class="price">$14.99/month</p>
                            <button class="premium-select-btn">Select</button>
                        </div>
                        <div class="premium-tier featured">
                            <h3>Annual VIP</h3>
                            <p class="price">$149.99/year</p>
                            <p class="savings">Save 17%</p>
                            <button class="premium-select-btn">Best Value</button>
                        </div>
                    </div>
                    <button class="modal-close">✕</button>
                </div>
            `;
            document.body.appendChild(premiumModal);

            // Add animation
            setTimeout(() => premiumModal.classList.add('active'), 10);

            // Close modal functionality
            const closeBtn = premiumModal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => {
                premiumModal.classList.remove('active');
                setTimeout(() => premiumModal.remove(), 300);
            });

            // Close on outside click
            premiumModal.addEventListener('click', (e) => {
                if (e.target === premiumModal) {
                    premiumModal.classList.remove('active');
                    setTimeout(() => premiumModal.remove(), 300);
                }
            });
        });
    });

    // Premium Preview Interaction
    document.querySelectorAll('.preview-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('premium')) {
                showPremiumModal();
            }
        });
    });

    // Progress Bar Animation
    function initProgressBar() {
        const progressBar = document.querySelector('.premium-progress');
        const progressFill = document.querySelector('.progress-fill');
        
        // Show progress bar after delay
        setTimeout(() => {
            progressBar.classList.add('show');
        }, 2000);

        // Animate progress fill
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = '73%';
        }, 2500);

        // Hide progress bar on close
        const closeProgress = document.createElement('button');
        closeProgress.className = 'close-progress';
        closeProgress.innerHTML = '×';
        progressBar.appendChild(closeProgress);

        closeProgress.addEventListener('click', () => {
            progressBar.classList.remove('show');
        });
    }

    // Premium Content Counter
    function updatePremiumCounter() {
        const premiumItems = document.querySelectorAll('.gallery-item.premium').length;
        const viewedItems = Math.floor(premiumItems * 0.73); // 73% viewed
        
        document.querySelector('.progress-text').textContent = 
            `${viewedItems} of ${premiumItems} premium items viewed`;
    }

    // Enhanced Premium Modal
    function showPremiumModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="premium-modal-content">
                <h2>🌟 Unlock VIP Access</h2>
                <p>Get instant access to all premium content and exclusive perks!</p>
                
                <div class="premium-features">
                    <div class="feature">
                        <span class="feature-icon">🎥</span>
                        <span class="feature-text">Exclusive photoshoots & behind-the-scenes</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">💬</span>
                        <span class="feature-text">Priority chat & custom requests</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🎁</span>
                        <span class="feature-text">Early access to new content</span>
                    </div>
                </div>

                <div class="premium-tiers">
                    <div class="premium-tier">
                        <h3>Monthly VIP</h3>
                        <p class="price">$14.99/month</p>
                        <ul class="tier-features">
                            <li>✓ All premium content</li>
                            <li>✓ Priority support</li>
                            <li>✓ Cancel anytime</li>
                        </ul>
                        <button class="premium-select-btn">Get Started</button>
                    </div>
                    <div class="premium-tier featured">
                        <div class="best-value">BEST VALUE</div>
                        <h3>Annual VIP</h3>
                        <p class="price">$149.99/year</p>
                        <p class="savings">Save 17%</p>
                        <ul class="tier-features">
                            <li>✓ All premium content</li>
                            <li>✓ Priority support</li>
                            <li>✓ Exclusive events</li>
                            <li>✓ Custom requests</li>
                        </ul>
                        <button class="premium-select-btn featured">Best Value</button>
                    </div>
                </div>
                
                <div class="satisfaction-guarantee">
                    <span class="guarantee-icon">🔒</span>
                    <p>30-day money-back guarantee</p>
                </div>
                
                <button class="modal-close">✕</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });

        // Handle subscription buttons
        modal.querySelectorAll('.premium-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Add subscription handling here
                showSuccessMessage('Thank you for joining! Processing your membership...');
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            });
        });
    }

    // Success Message
    function showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize all premium features
    initProgressBar();
    updatePremiumCounter();

    // Add GSAP animations
    gsap.utils.toArray('.gallery-item').forEach((item, index) => {
        gsap.fromTo(item, {
            opacity: 0,
            y: 20
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: index * 0.2,
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.from('.nav-brand', {
        opacity: 0,
        x: -20,
        duration: 1,
        delay: 0.5
    });

    gsap.from('.nav-links a', {
        opacity: 0,
        x: -20,
        duration: 1,
        delay: 0.7,
        stagger: 0.2
    });
});

// Testimonials Slider
let currentSlide = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const totalSlides = testimonialCards.length;

function showSlide(index) {
    testimonialCards.forEach((card, i) => {
        card.style.transform = `translateX(${100 * (i - index)}%)`;
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

// Initialize slider
showSlide(0);
setInterval(nextSlide, 5000);

// Lazy Loading for Images
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
});

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Custom cursor
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
    
    gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
    });
});

// Gallery animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Masonry layout
    const grid = document.querySelector('.gallery-grid');
    const masonry = new Masonry(grid, {
        itemSelector: '.gallery-item',
        columnWidth: '.gallery-item',
        gutter: 20,
        percentPosition: true
    });

    // Initialize lazy loading
    const lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy"
    });

    // Animate gallery items on scroll
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            },
            y: 100,
            opacity: 0,
            duration: 1,
            delay: i * 0.1
        });
    });

    // Premium content hover effect
    document.querySelectorAll('.gallery-item.premium').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item.querySelector('.premium-overlay'), {
                opacity: 1,
                duration: 0.3
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item.querySelector('.premium-overlay'), {
                opacity: 0.8,
                duration: 0.3
            });
        });
    });
});

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        galleryItems.forEach(item => {
            gsap.to(item, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                onComplete: () => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        gsap.to(item, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.3
                        });
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    galleryItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const match = title.includes(searchTerm);

        gsap.to(item, {
            opacity: match ? 1 : 0.3,
            scale: match ? 1 : 0.95,
            duration: 0.3
        });
    });
});

// Floating action button
const fabButton = document.querySelector('.fab-button');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        gsap.to(fabButton, {
            opacity: 1,
            scale: 1,
            duration: 0.3
        });
    } else {
        gsap.to(fabButton, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3
        });
    }
});

fabButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Chat widget
const chatButton = document.querySelector('.chat-toggle');
const chatContainer = document.querySelector('.chat-container');
let chatOpen = false;

chatButton.addEventListener('click', () => {
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatContainer.style.display = 'block';
        gsap.from(chatContainer, {
            y: 20,
            opacity: 0,
            duration: 0.3
        });
    } else {
        gsap.to(chatContainer, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                chatContainer.style.display = 'none';
            }
        });
    }
});

import { fetchGalleryItems, createGalleryItemTemplate } from './gallery-content.js';

class GalleryManager {
    constructor() {
        this.currentPage = 1;
        this.loading = false;
        this.currentFilter = 'all';
        this.grid = document.querySelector('.gallery-grid');
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.searchInput = document.querySelector('.search-bar input');
        
        this.masonry = new Masonry(this.grid, {
            itemSelector: '.gallery-item',
            columnWidth: '.gallery-item',
            percentPosition: true,
            transitionDuration: '0.3s'
        });
        
        this.init();
    }
    
    init() {
        this.loadInitialContent();
        this.setupEventListeners();
        this.initializeAnimations();
    }
    
    async loadInitialContent() {
        await this.loadMoreContent();
        this.masonry.layout();
    }
    
    setupEventListeners() {
        // Load More Button
        this.loadMoreBtn.addEventListener('click', async () => {
            this.loadMoreBtn.classList.add('loading');
            await this.loadMoreContent();
            this.loadMoreBtn.classList.remove('loading');
        });
        
        // Filter Buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterGallery(filter);
                
                // Update active state
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Search Input
        let debounceTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.searchGallery(e.target.value);
            }, 300);
        });
        
        // Gallery Item Interactions
        this.grid.addEventListener('click', (e) => {
            const target = e.target;
            
            // Like Button
            if (target.closest('.like-btn')) {
                this.handleLike(target.closest('.gallery-item'));
            }
            
            // Share Button
            if (target.closest('.share-btn')) {
                this.handleShare(target.closest('.gallery-item'));
            }
            
            // Save Button
            if (target.closest('.save-btn')) {
                this.handleSave(target.closest('.gallery-item'));
            }
            
            // Unlock Premium Content
            if (target.closest('.unlock-btn')) {
                this.handleUnlock(target.closest('.gallery-item'));
            }
        });
    }
    
    async loadMoreContent() {
        if (this.loading) return;
        
        this.loading = true;
        const items = await fetchGalleryItems(this.currentPage);
        
        if (items.length === 0) {
            this.loadMoreBtn.style.display = 'none';
            this.loading = false;
            return;
        }
        
        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.innerHTML = createGalleryItemTemplate(item);
            fragment.appendChild(itemElement.firstChild);
        });
        
        this.grid.appendChild(fragment);
        this.currentPage++;
        
        // Initialize new items
        this.initializeNewItems(fragment);
        this.masonry.layout();
        
        this.loading = false;
    }
    
    initializeNewItems(container) {
        // Initialize lazy loading for new images
        const lazyImages = container.querySelectorAll('.lazy');
        lazyImages.forEach(img => {
            img.addEventListener('load', () => {
                this.masonry.layout();
            });
        });
        
        // Initialize magnetic elements
        const magneticElements = container.querySelectorAll('.magnetic-element');
        magneticElements.forEach(element => {
            this.initializeMagneticEffect(element);
        });
        
        // Initialize hover animations
        const items = container.querySelectorAll('.gallery-item');
        items.forEach(item => {
            this.initializeHoverAnimation(item);
        });
    }
    
    filterGallery(filter) {
        this.currentFilter = filter;
        const items = this.grid.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            const matches = filter === 'all' || item.dataset.category === filter;
            const action = matches ? 'remove' : 'add';
            item.classList[action]('hidden');
            
            gsap.to(item, {
                opacity: matches ? 1 : 0,
                scale: matches ? 1 : 0.8,
                duration: 0.3,
                onComplete: () => {
                    this.masonry.layout();
                }
            });
        });
    }
    
    searchGallery(query) {
        const items = this.grid.querySelectorAll('.gallery-item');
        const normalizedQuery = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const matches = title.includes(normalizedQuery);
            
            gsap.to(item, {
                opacity: matches ? 1 : 0.3,
                scale: matches ? 1 : 0.95,
                duration: 0.3,
                onComplete: () => {
                    this.masonry.layout();
                }
            });
        });
    }
    
    initializeMagneticEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(element, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }
    
    initializeHoverAnimation(item) {
        const overlay = item.querySelector('.gallery-overlay');
        const content = item.querySelector('.overlay-content');
        
        item.addEventListener('mouseenter', () => {
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.3
            });
            
            gsap.from(content, {
                y: 20,
                opacity: 0,
                duration: 0.4,
                delay: 0.1
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.3
            });
        });
    }
    
    initializeAnimations() {
        // Parallax scroll effect
        const galleryItems = this.grid.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            gsap.to(item, {
                y: (i) => Math.sin(i * 0.5) * 50,
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });
        
        // Infinite scroll detection
        ScrollTrigger.create({
            trigger: this.grid,
            start: "bottom bottom+=200",
            onEnter: () => {
                this.loadMoreContent();
            }
        });
    }
    
    handleLike(item) {
        const likeBtn = item.querySelector('.like-btn');
        const likesCount = item.querySelector('.gallery-likes');
        
        likeBtn.classList.toggle('active');
        
        // Animate the like action
        if (likeBtn.classList.contains('active')) {
            gsap.from(likeBtn, {
                scale: 1.5,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
            
            // Create and animate floating hearts
            for (let i = 0; i < 5; i++) {
                const heart = document.createElement('i');
                heart.className = 'fas fa-heart floating-heart';
                item.appendChild(heart);
                
                gsap.to(heart, {
                    y: -100 * Math.random() - 50,
                    x: 40 * (Math.random() - 0.5),
                    rotation: Math.random() * 360,
                    opacity: 0,
                    duration: 1 + Math.random(),
                    onComplete: () => heart.remove()
                });
            }
        }
    }
    
    handleShare(item) {
        const shareBtn = item.querySelector('.share-btn');
        
        // Animate the share button
        gsap.to(shareBtn, {
            rotation: 360,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Create a dummy share dialog
        const shareDialog = document.createElement('div');
        shareDialog.className = 'share-dialog glass-card';
        shareDialog.innerHTML = `
            <div class="share-header">
                <h4>Share This Content</h4>
                <button class="close-share">×</button>
            </div>
            <div class="share-options">
                <button class="share-option" data-platform="facebook">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button class="share-option" data-platform="twitter">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="share-option" data-platform="instagram">
                    <i class="fab fa-instagram"></i> Instagram
                </button>
                <button class="share-option" data-platform="pinterest">
                    <i class="fab fa-pinterest"></i> Pinterest
                </button>
            </div>
        `;
        
        document.body.appendChild(shareDialog);
        
        gsap.from(shareDialog, {
            y: 20,
            opacity: 0,
            duration: 0.3
        });
        
        // Close dialog functionality
        const closeBtn = shareDialog.querySelector('.close-share');
        closeBtn.addEventListener('click', () => {
            gsap.to(shareDialog, {
                y: 20,
                opacity: 0,
                duration: 0.3,
                onComplete: () => shareDialog.remove()
            });
        });
    }
    
    handleSave(item) {
        const saveBtn = item.querySelector('.save-btn');
        
        saveBtn.classList.toggle('active');
        
        // Animate the save action
        if (saveBtn.classList.contains('active')) {
            gsap.from(saveBtn, {
                scale: 1.2,
                rotation: 20,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }
    }
    
    handleUnlock(item) {
        const unlockBtn = item.querySelector('.unlock-btn');
        
        // Animate the unlock button
        gsap.to(unlockBtn, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
        
        // Show premium content modal
        this.showPremiumModal();
    }
    
    showPremiumModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal glass-card';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Unlock Premium Content</h2>
                <p>Get access to exclusive content and features!</p>
                <div class="premium-features">
                    <div class="feature">
                        <i class="fas fa-crown"></i>
                        <span>Exclusive Photos</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-star"></i>
                        <span>Behind the Scenes</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-comments"></i>
                        <span>Priority Support</span>
                    </div>
                </div>
                <button class="premium-cta magnetic-element">Join VIP Now</button>
                <button class="modal-close">Maybe Later</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        gsap.from(modal, {
            y: 100,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            gsap.to(modal, {
                y: 100,
                opacity: 0,
                duration: 0.3,
                onComplete: () => modal.remove()
            });
        });
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GalleryManager();
});
