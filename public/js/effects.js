// Advanced Visual Effects and Animations
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class BackgroundEffect {
    constructor() {
        this.container = document.querySelector('.webgl-background');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.clock = new THREE.Clock();
        this.particles = [];
        this.flowField = [];
        this.mousePosition = new THREE.Vector2();
        this.targetMousePosition = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.z = 5;
        
        // Create particle system
        this.createParticleSystem();
        
        // Setup post-processing
        this.setupPostProcessing();
        
        // Event listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Start animation
        this.animate();
    }
    
    createParticleSystem() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            // Color
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
            
            // Size
            sizes[i] = Math.random() * 20;
            
            // Store particle data
            this.particles.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                originalPosition: new THREE.Vector3(
                    positions[i * 3],
                    positions[i * 3 + 1],
                    positions[i * 3 + 2]
                )
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    vec2 xy = gl_PointCoord.xy - vec2(0.5);
                    float ll = length(xy);
                    float alpha = 1.0 - smoothstep(0.45, 0.5, ll);
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // Strength
            0.4, // Radius
            0.85  // Threshold
        );
        this.composer.addPass(bloomPass);
    }
    
    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;
            
            // Update position based on flow field
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            // Create flow field effect
            const angle = noise.simplex3(x * 0.1, y * 0.1, time * 0.1) * Math.PI * 2;
            const strength = 0.01;
            
            particle.velocity.x += Math.cos(angle) * strength;
            particle.velocity.y += Math.sin(angle) * strength;
            
            // Mouse interaction
            const mouseInfluence = new THREE.Vector3(
                this.mousePosition.x - x,
                this.mousePosition.y - y,
                0
            );
            const distance = mouseInfluence.length();
            if (distance < 2) {
                const force = (1 - distance / 2) * 0.01;
                particle.velocity.add(mouseInfluence.normalize().multiplyScalar(force));
            }
            
            // Update position
            positions[i3] += particle.velocity.x;
            positions[i3 + 1] += particle.velocity.y;
            positions[i3 + 2] += particle.velocity.z;
            
            // Boundary check
            const bound = 5;
            if (Math.abs(positions[i3]) > bound) particle.velocity.x *= -1;
            if (Math.abs(positions[i3 + 1]) > bound) particle.velocity.y *= -1;
            if (Math.abs(positions[i3 + 2]) > bound) particle.velocity.z *= -1;
            
            // Update colors based on position and time
            const hue = (time * 0.1 + (x + y) * 0.1) % 1;
            const color = new THREE.Color().setHSL(hue, 0.6, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
    }
    
    onMouseMove(event) {
        // Convert mouse position to normalized device coordinates
        this.targetMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Smooth mouse movement
        this.mousePosition.lerp(this.targetMousePosition, 0.1);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.updateParticles();
        
        // Rotate particle system
        this.particleSystem.rotation.y += 0.001;
        
        // Render scene with post-processing
        this.composer.render();
    }
}

// Initialize noise
const noise = {
    simplex3: function(x, y, z) {
        // Simplified noise function implementation
        return Math.sin(x * 10 + y * 15 + z * 20) * 0.5 +
               Math.sin(x * 20 + y * 25 + z * 30) * 0.25 +
               Math.sin(x * 30 + y * 35 + z * 40) * 0.125;
    }
};

// Export for use in other files
export { BackgroundEffect };

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const effect = new BackgroundEffect();
});
