class SubscriptionModal {
    constructor() {
        this.modal = null;
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Create modal HTML
        this.createModal();
        
        // Initialize Stripe elements
        this.stripe = Stripe('your_publishable_key');
        this.elements = this.stripe.elements();
        
        // Create card element
        this.card = this.elements.create('card', {
            style: {
                base: {
                    color: '#ffffff',
                    fontFamily: '"Montserrat", sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        // Mount card element
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
            this.card.mount('#card-element');
        }

        this.initialized = true;
    }

    createModal() {
        const modalHTML = `
            <div id="subscription-modal" class="modal">
                <div class="modal-content glass-morphism">
                    <div class="modal-header">
                        <h2>Choose Your VIP Access</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="subscription-tiers">
                        ${Object.values(subscriptionTiers).map(tier => this.createTierCard(tier)).join('')}
                    </div>
                    <div id="payment-form" class="payment-form hidden">
                        <div class="form-row">
                            <label for="card-element">Credit or debit card</label>
                            <div id="card-element"></div>
                            <div id="card-errors" role="alert"></div>
                        </div>
                        <button id="submit-payment" class="primary-btn">
                            <span id="button-text">Subscribe Now</span>
                            <div class="spinner hidden" id="spinner"></div>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    createTierCard(tier) {
        return `
            <div class="tier-card ${tier.id === 'sub_premium' ? 'featured' : ''}">
                ${tier.id === 'sub_premium' ? '<div class="featured-badge">Most Popular</div>' : ''}
                <h3>${tier.name}</h3>
                <div class="tier-price">
                    <span class="currency">$</span>
                    <span class="amount">${tier.price}</span>
                    <span class="period">/${tier.period}</span>
                </div>
                <ul class="tier-features">
                    ${tier.features.map(feature => `
                        <li>
                            <span class="feature-icon">✓</span>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
                <button class="primary-btn subscribe-btn" data-tier="${tier.id}">
                    Choose ${tier.name}
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        const modal = document.getElementById('subscription-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const subscribeBtns = modal.querySelectorAll('.subscribe-btn');
        const paymentForm = document.getElementById('payment-form');

        closeBtn.addEventListener('click', () => this.hide());

        subscribeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tierId = e.target.dataset.tier;
                this.showPaymentForm(tierId);
            });
        });

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePaymentSubmission();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hide();
        });
    }

    showPaymentForm(tierId) {
        const tier = subscriptionTiers[tierId];
        const paymentForm = document.getElementById('payment-form');
        const tiers = document.querySelector('.subscription-tiers');

        // Update button text with selected tier
        const submitBtn = document.getElementById('submit-payment');
        submitBtn.innerHTML = `Subscribe to ${tier.name} - $${tier.price}/${tier.period}`;

        // Slide transition
        tiers.style.transform = 'translateX(-100%)';
        paymentForm.classList.remove('hidden');
        
        // Store selected tier
        paymentForm.dataset.selectedTier = tierId;
    }

    async handlePaymentSubmission() {
        const paymentForm = document.getElementById('payment-form');
        const submitButton = document.getElementById('submit-payment');
        const spinner = document.getElementById('spinner');
        const buttonText = document.getElementById('button-text');

        // Prevent double submission
        submitButton.disabled = true;
        spinner.classList.remove('hidden');
        buttonText.classList.add('hidden');

        try {
            const tierId = paymentForm.dataset.selectedTier;
            await contentManager.subscribe(tierId);
            this.hide();
            this.showSuccess();
        } catch (error) {
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = error.message;
        }

        submitButton.disabled = false;
        spinner.classList.add('hidden');
        buttonText.classList.remove('hidden');
    }

    show() {
        const modal = document.getElementById('subscription-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        const modal = document.getElementById('subscription-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset form
        const paymentForm = document.getElementById('payment-form');
        const tiers = document.querySelector('.subscription-tiers');
        paymentForm.classList.add('hidden');
        tiers.style.transform = '';
    }

    showSuccess() {
        // Implement success message/animation
        const successToast = document.createElement('div');
        successToast.className = 'success-toast';
        successToast.textContent = 'Successfully subscribed! Welcome to the VIP club!';
        document.body.appendChild(successToast);

        setTimeout(() => {
            successToast.remove();
        }, 5000);
    }
}

// Initialize subscription modal
const subscriptionModal = new SubscriptionModal();
subscriptionModal.initialize();
