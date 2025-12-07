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


// ===== Form Handling =====
const orderForm = document.getElementById('orderForm');
const modal = document.getElementById('successModal');
const modalClose = document.querySelector('.modal-close');
const modalBtn = document.querySelector('.modal-btn');

// Set minimum date to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// Phone number formatting
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value[0] === '8') {
            value = '7' + value.slice(1);
        }
        if (value[0] !== '7') {
            value = '7' + value;
        }
    }
    
    let formatted = '';
    if (value.length > 0) {
        formatted = '+7';
        if (value.length > 1) {
            formatted += ' (' + value.slice(1, 4);
        }
        if (value.length > 4) {
            formatted += ') ' + value.slice(4, 7);
        }
        if (value.length > 7) {
            formatted += '-' + value.slice(7, 9);
        }
        if (value.length > 9) {
            formatted += '-' + value.slice(9, 11);
        }
    }
    
    e.target.value = formatted;
});

// Form submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic validation
    const phone = phoneInput.value.replace(/\D/g, '');
    if (phone.length < 11) {
        phoneInput.focus();
        phoneInput.style.borderColor = '#c41e3a';
        setTimeout(() => {
            phoneInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    // Show success modal
    modal.classList.add('active');
    
    // Reset form
    orderForm.reset();
});

// Close modal handlers
function closeModal() {
    modal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Prevent context menu on buttons to avoid showing link preview/address on long press
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

// Fix viewport height for mobile browsers (address bar causes 100vh to change)
function setStableViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--stable-vh', `${vh}px`);
}
setStableViewportHeight();
// Only update on orientation change, not on scroll (which triggers address bar hide/show)
window.addEventListener('orientationchange', () => {
    setTimeout(setStableViewportHeight, 100);
});

// Smooth scrolling for anchor links with header offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const header = document.querySelector('.header');
            const baseOffset = header ? header.offsetHeight + 15 : 80;
            
            // Extra offset for sections
            const isMobile = window.innerWidth <= 768;
            let extraOffset = 0;
            if (targetId === '#order') {
                extraOffset = -75;
            } else if (targetId === '#stores' && isMobile) {
                extraOffset = -65; // Adjust this value as needed
            }
            const headerOffset = baseOffset + extraOffset;
            
            // Calculate absolute position by walking up offsetParent chain
            let absoluteTop = 0;
            let el = targetElement;
            while (el) {
                absoluteTop += el.offsetTop;
                el = el.offsetParent;
            }
            
            const targetPosition = absoluteTop - headerOffset;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    });
});
