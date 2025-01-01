// Initialize all core functionalities
document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        mirror: false
    });

    // Initialize Masonry Layout
    const grid = document.querySelector('.gallery-grid');
    const masonry = new Masonry(grid, {
        itemSelector: '.gallery-item',
        columnWidth: '.gallery-item',
        percentPosition: true,
        transitionDuration: '0.3s'
    });

    // Initialize Lazy Loading
    const lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy",
        callback_loaded: (el) => {
            masonry.layout();
        }
    });

    // Dynamic Content Loading
    let page = 1;
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    async function loadGalleryItems() {
        const response = await fetch(`/api/gallery?page=${page}`);
        const items = await response.json();
        
        items.forEach(item => {
            const itemElement = createGalleryItem(item);
            grid.appendChild(itemElement);
            lazyLoadInstance.update();
            masonry.appended(itemElement);
        });

        page++;
        
        if (items.length < 12) {
            loadMoreBtn.style.display = 'none';
        }
    }

    function createGalleryItem(item) {
        const template = `
            <div class="gallery-item ${item.premium ? 'premium' : ''}" data-category="${item.category}" data-aos="fade-up">
                <div class="item-wrapper glass-card">
                    ${item.premium ? `
                        <div class="premium-overlay">
                            <span class="premium-badge"><i class="fas fa-crown"></i> VIP</span>
                            <button class="unlock-btn">Unlock Content</button>
                        </div>
                    ` : ''}
                    <a href="${item.fullImage}" data-lightbox="gallery">
                        <img data-src="${item.thumbnail}" alt="${item.title}" class="lazy">
                        <div class="gallery-overlay">
                            <div class="overlay-content">
                                <span class="gallery-likes"><i class="fas fa-heart"></i> ${item.likes}</span>
                                <span class="gallery-views"><i class="fas fa-eye"></i> ${item.views}</span>
                            </div>
                        </div>
                    </a>
                    <div class="item-info">
                        <h3>${item.title}</h3>
                        <div class="item-meta">
                            <span><i class="fas fa-calendar"></i> ${item.date}</span>
                            <span><i class="fas fa-comment"></i> ${item.comments}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = template.trim();
        return div.firstChild;
    }

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    let darkMode = localStorage.getItem('darkMode') === 'true';

    function toggleTheme() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('darkMode', darkMode);
        
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon', !darkMode);
        icon.classList.toggle('fa-sun', darkMode);
    }

    themeToggle.addEventListener('click', toggleTheme);
    if (darkMode) toggleTheme();

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number[data-value]');
    stats.forEach(stat => {
        const value = parseInt(stat.dataset.value);
        gsap.to(stat, {
            innerText: value,
            duration: 2,
            snap: { innerText: 1 },
            scrollTrigger: {
                trigger: stat,
                start: "top center+=100",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Magnetic Elements
    const magneticElements = document.querySelectorAll('.magnetic-element');
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(element, {
                x: x * 0.2,
                y: y * 0.2,
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
    });

    // Custom Cursor
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

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
        follower.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
        follower.classList.remove('active');
    });

    // Loader Animation
    const loader = document.querySelector('.loader');
    const loaderText = document.querySelector('.loader-text');
    const originalText = loaderText.dataset.text;
    let dots = 0;

    const loaderInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        loaderText.textContent = originalText + '.'.repeat(dots);
    }, 500);

    window.addEventListener('load', () => {
        clearInterval(loaderInterval);
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loader.style.display = 'none';
            }
        });
    });

    // Initialize all premium features
    initProgressBar();
    updatePremiumCounter();
});

// Initialize smooth scroll
window.addEventListener('load', () => {
    if (typeof window.Lenis !== 'undefined') {
        const lenis = new window.Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    } else {
        console.warn('Lenis is not defined. Smooth scrolling is disabled.');
    }
});

// Loader
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Initialize parallax
const scene = document.getElementById('scene');
if (scene) {
    const parallaxInstance = new Parallax(scene);
}

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Navigation animations
gsap.from('.nav-brand', {
    opacity: 0,
    x: -20,
    duration: 1,
    delay: 0.5
});

gsap.from('.nav-links a', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    stagger: 0.1,
    delay: 0.7
});

gsap.from('.nav-cta', {
    opacity: 0,
    x: 20,
    duration: 1,
    delay: 0.5
});

// Feature cards animation
gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.2
    });
});

// Subscription tiers animation
gsap.utils.toArray('.tier').forEach((tier, i) => {
    gsap.from(tier, {
        scrollTrigger: {
            trigger: tier,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.2
    });
});

// Social stats counter animation
gsap.utils.toArray('.count').forEach(counter => {
    const target = parseInt(counter.textContent);
    gsap.to(counter, {
        scrollTrigger: {
            trigger: counter,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        textContent: target,
        duration: 2,
        snap: { textContent: 1 },
        ease: 'power1.inOut'
    });
});

// Custom cursor
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.cursor-follower');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Cursor movement with lerp
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;

    cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
    follower.style.transform = `translate(${followerX - 4}px, ${followerY - 4}px)`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects
const links = document.querySelectorAll('a, button');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        follower.classList.add('cursor-hover');
    });
    
    link.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('cursor-hover');
    });
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Chat functionality
const chatButton = document.getElementById('chatButton');
const chatContainer = document.getElementById('chatContainer');
const closeChat = document.getElementById('closeChat');
const messageInput = document.getElementById('messageInput');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');

if (chatButton && chatContainer) {
    chatButton.addEventListener('click', () => {
        chatContainer.classList.add('active');
        gsap.from(chatContainer, {
            opacity: 0,
            y: 20,
            duration: 0.5
        });
    });

    closeChat.addEventListener('click', () => {
        gsap.to(chatContainer, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            onComplete: () => {
                chatContainer.classList.remove('active');
                chatContainer.style.opacity = '';
                chatContainer.style.transform = '';
            }
        });
    });

    const addMessage = (message, isSent = true) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        
        gsap.from(messageDiv, {
            opacity: 0,
            y: 20,
            duration: 0.3
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSendMessage = () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message);
            messageInput.value = '';
            
            setTimeout(() => {
                const responses = [
                    "Thanks for your message! 💕",
                    "I'll get back to you soon! 😊",
                    "Don't forget to check out my exclusive content! 🔥",
                    "Thanks for supporting! 💖"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, false);
            }, 1000);
        }
    };

    sendMessage.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}
