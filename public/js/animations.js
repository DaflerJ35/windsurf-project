// Advanced Animations and Interactions
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin, CustomEase);

// Custom Easing Functions
CustomEase.create("bounceOut", "M0,0 C0.0,0.0 0.2,2.5 0.3,2.5 0.3,2.5 0.7,1.0 1.0,1.0");
CustomEase.create("elasticOut", "M0,0 C0.0,0.0 0.2,2.5 0.3,2.5 0.3,2.5 0.7,0.0 1.0,1.0");

class AdvancedAnimations {
    constructor() {
        this.initializeAnimations();
        this.setupScrollTriggers();
        this.setupHoverEffects();
        this.setupParallaxEffects();
    }

    initializeAnimations() {
        // Hero Section Animation
        gsap.from('.hero-content > *', {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        // Stats Counter Animation
        gsap.to('.stat-number', {
            duration: 2,
            scrambleText: {
                text: "{original}",
                chars: "0123456789",
                speed: 0.3,
                delimiter: ""
            },
            ease: "power1.inOut"
        });

        // Gallery Grid Stagger Animation
        gsap.from('.gallery-item', {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            stagger: {
                amount: 1,
                grid: "auto",
                from: "center"
            },
            ease: "elastic.out(1, 0.3)"
        });
    }

    setupScrollTriggers() {
        // Parallax Background
        gsap.to('.hero-background', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
            ease: "none"
        });

        // Gallery Items Reveal
        gsap.utils.toArray('.gallery-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse"
                },
                y: 100,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            });
        });

        // Premium Features Animation
        const benefits = gsap.utils.toArray('.benefit-card');
        benefits.forEach((benefit, i) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: benefit,
                    start: "top center+=100",
                    toggleActions: "play none none reverse"
                }
            });

            tl.from(benefit, {
                x: i % 2 === 0 ? -100 : 100,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            })
            .from(benefit.querySelector('.benefit-icon'), {
                scale: 0,
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, "-=0.5")
            .from(benefit.querySelectorAll('h3, p'), {
                y: 50,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.3");
        });
    }

    setupHoverEffects() {
        // Gallery Item Hover Effect
        gsap.utils.toArray('.gallery-item').forEach(item => {
            const overlay = item.querySelector('.gallery-overlay');
            const content = item.querySelector('.overlay-content');
            
            const tl = gsap.timeline({ paused: true });
            
            tl.to(overlay, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.inOut"
            })
            .from(content.children, {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.1");

            item.addEventListener('mouseenter', () => tl.play());
            item.addEventListener('mouseleave', () => tl.reverse());
        });

        // Button Hover Effects
        gsap.utils.toArray('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.in"
                });
            });
        });
    }

    setupParallaxEffects() {
        // Mouse Move Parallax
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            gsap.utils.toArray('[data-parallax]').forEach(element => {
                const speed = element.dataset.parallax || 0.1;
                const x = (clientX - centerX) * speed;
                const y = (clientY - centerY) * speed;

                gsap.to(element, {
                    x,
                    y,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        });

        // Scroll Parallax
        gsap.utils.toArray('[data-speed]').forEach(element => {
            gsap.to(element, {
                y: (i, target) => (ScrollTrigger.maxScroll(window) - ScrollTrigger.scrollTop()) * target.dataset.speed,
                ease: "none",
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        });
    }

    // Text Scramble Effect
    textScramble(element, newText) {
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        const originalText = element.innerText;
        let frame = 0;
        let frameRequest;
        let queue = [];

        const update = () => {
            let output = '';
            let complete = 0;
            
            for (let i = 0, n = queue.length; i < n; i++) {
                let { from, to, start, end, char } = queue[i];
                if (frame >= end) {
                    complete++;
                    output += to;
                } else if (frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = chars[Math.floor(Math.random() * chars.length)];
                        queue[i].char = char;
                    }
                    output += char;
                } else {
                    output += from;
                }
            }

            element.innerHTML = output;
            if (complete === queue.length) {
                cancelAnimationFrame(frameRequest);
            } else {
                frameRequest = requestAnimationFrame(update);
                frame++;
            }
        };

        const setText = () => {
            const oldText = element.innerText;
            const length = Math.max(oldText.length, newText.length);
            queue = [];
            
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(frameRequest);
            frame = 0;
            update();
        };

        setText();
    }

    // Magnetic Effect
    magneticEffect(element, strength = 0.3) {
        const bound = element.getBoundingClientRect();
        const centerX = bound.left + bound.width / 2;
        const centerY = bound.top + bound.height / 2;

        element.addEventListener('mousemove', (e) => {
            const deltaX = Math.floor((e.clientX - centerX) * strength);
            const deltaY = Math.floor((e.clientY - centerY) * strength);

            gsap.to(element, {
                x: deltaX,
                y: deltaY,
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
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    const animations = new AdvancedAnimations();
});

export { AdvancedAnimations };
