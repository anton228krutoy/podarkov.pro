// ===== Snowflakes Animation =====
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

function updateCanvasSize() {
    const order = document.querySelector('.order');
    
    if (order) {
        width = canvas.width = window.innerWidth;
        // Canvas covers Hero + Stores sections (up to where Order section starts)
        height = canvas.height = order.offsetTop;
    } else {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
}

// Recalculate after page fully loads (fonts, images, etc.)
window.addEventListener('load', () => {
    updateCanvasSize();
});

let width, height;
updateCanvasSize();

// Mouse position tracking
const mouse = {
    x: null,
    y: null,
    radius: 100 // Radius of cursor influence
};

// Track mouse movement (accounting for scroll)
document.addEventListener('mousemove', (e) => {
    // x is relative to viewport, same as canvas left
    mouse.x = e.clientX;
    // y needs to include scroll position because canvas is absolute
    mouse.y = e.clientY + window.scrollY;
});

// Reset mouse position when leaving window
document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Snowflake class
class Snowflake {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.size = Math.random() * 4 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.wind = Math.random() * 0.5 - 0.25;
        // Velocity for smooth movement
        this.vx = 0;
        this.vy = this.speed;
    }

    update() {
        // Apply gravity (falling down)
        this.vy = this.speed;
        this.vx = this.wind;

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Calculate repulsion force (stronger when closer)
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                
                // Apply force away from cursor
                this.vx += Math.cos(angle) * force * 3;
                this.vy += Math.sin(angle) * force * 3;
            }
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Reset snowflake if it goes off screen
        if (this.y > height + 10) {
            this.y = -10;
            this.x = Math.random() * width;
        }

        // Wrap horizontally
        if (this.x > width + 10) {
            this.x = -10;
        } else if (this.x < -10) {
            this.x = width + 10;
        }
    }

    draw() {
        // Fade out in the bottom 150px of the canvas
        const fadeZone = 150;
        let opacity = this.opacity;
        
        if (this.y > height - fadeZone) {
            const fadeProgress = (this.y - (height - fadeZone)) / fadeZone;
            opacity = this.opacity * (1 - fadeProgress);
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
    }
}

// Create snowflakes array
const snowflakeCount = Math.floor((width * height) / 8000); // Adaptive count based on screen size
const snowflakes = [];

for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = new Snowflake();
    snowflake.y = Math.random() * height; // Distribute initially across screen
    snowflakes.push(snowflake);
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const snowflake of snowflakes) {
        snowflake.update();
        snowflake.draw();
    }

    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    updateCanvasSize();
});

// Start animation
animate();
