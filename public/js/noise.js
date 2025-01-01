// Perlin Noise Implementation
class Noise {
    constructor(octaves = 4) {
        this.octaves = octaves;
        this.p = new Uint8Array(512);
        this.permutation = new Uint8Array(256);
        this.init();
    }

    init() {
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = Math.floor(Math.random() * 256);
        }
        
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i & 255];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.p[AA], x, y, z),
                    this.grad(this.p[BA], x - 1, y, z)
                ),
                this.lerp(u,
                    this.grad(this.p[AB], x, y - 1, z),
                    this.grad(this.p[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.p[AA + 1], x, y, z - 1),
                    this.grad(this.p[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(u,
                    this.grad(this.p[AB + 1], x, y - 1, z - 1),
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }

    // Generate fractal noise
    fractal(x, y, z) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

// Flow Field Generator
class FlowField {
    constructor(width, height, scale = 20) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.cols = Math.floor(width / scale);
        this.rows = Math.floor(height / scale);
        this.field = new Array(this.cols * this.rows);
        this.noise = new Noise(4);
        this.zoff = 0;
    }

    update() {
        let yoff = 0;
        for (let y = 0; y < this.rows; y++) {
            let xoff = 0;
            for (let x = 0; x < this.cols; x++) {
                const index = x + y * this.cols;
                const angle = this.noise.fractal(xoff, yoff, this.zoff) * Math.PI * 2;
                const vector = { x: Math.cos(angle), y: Math.sin(angle) };
                this.field[index] = vector;
                xoff += 0.1;
            }
            yoff += 0.1;
        }
        this.zoff += 0.01;
    }

    lookup(x, y) {
        const col = Math.floor(x / this.scale);
        const row = Math.floor(y / this.scale);
        const index = col + row * this.cols;
        return this.field[index];
    }
}

// Particle System for Flow Field Visualization
class Particle {
    constructor(width, height) {
        this.pos = { x: Math.random() * width, y: Math.random() * height };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.maxSpeed = 4;
        this.prevPos = { ...this.pos };
        this.width = width;
        this.height = height;
    }

    update() {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (speed > this.maxSpeed) {
            this.vel.x = (this.vel.x / speed) * this.maxSpeed;
            this.vel.y = (this.vel.y / speed) * this.maxSpeed;
        }

        this.prevPos = { ...this.pos };
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x = 0;
        this.acc.y = 0;

        this.edges();
    }

    applyForce(force) {
        this.acc.x += force.x;
        this.acc.y += force.y;
    }

    edges() {
        if (this.pos.x > this.width) {
            this.pos.x = 0;
            this.prevPos.x = 0;
        }
        if (this.pos.x < 0) {
            this.pos.x = this.width;
            this.prevPos.x = this.width;
        }
        if (this.pos.y > this.height) {
            this.pos.y = 0;
            this.prevPos.y = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = this.height;
            this.prevPos.y = this.height;
        }
    }

    follow(flowfield) {
        const x = Math.floor(this.pos.x / flowfield.scale);
        const y = Math.floor(this.pos.y / flowfield.scale);
        const index = x + y * flowfield.cols;
        const force = flowfield.field[index];
        this.applyForce(force);
    }
}

export { Noise, FlowField, Particle };
