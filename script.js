// ===== Stores Data =====
const storesData = {
    moscow: [
        {
            name: 'ТЦ «Мега Белая Дача»',
            address: '1-й Покровский пр-д, 5, Котельники',
            hours: { start: '10:00', end: '23:00' }
        },
        {
            name: 'ТРЦ «Город»',
            address: 'Шоссе Энтузиастов, 12к2',
            hours: { start: '10:00', end: '22:00' }
        },
        {
            name: 'ТРЦ «Облака»',
            address: 'Ореховый б-р, д.22 А',
            hours: { start: '10:00', end: '22:00' }
        },
        {
            name: 'ТРЦ «Косино Парк»',
            address: 'Святоозёрская ул., 1А',
            hours: { start: '10:00', end: '22:00' }
        }
    ],
    spb: [
        {
            name: 'ТЦ «Галерея»',
            address: 'Лиговский пр., 30А',
            hours: { start: '10:00', end: '23:00' }
        },
        {
            name: 'ТЦ «Рио»',
            address: 'Ул. Фучика, д.2',
            hours: { start: '10:00', end: '22:00' }
        }
    ]
};

// ===== Stores Rendering =====
function renderStores(city) {
    const storesGrid = document.getElementById('storesGrid');
    const stores = storesData[city] || [];
    
    storesGrid.innerHTML = stores.map(store => `
        <div class="store-card">
            <div class="store-icon">📍</div>
            <h3 class="store-name">${store.name}</h3>
            <p class="store-address">${store.address}</p>
            <p class="store-hours">Ежедневно: ${store.hours.start} — ${store.hours.end}</p>
        </div>
    `).join('');
}

// ===== City Selector =====
const cityButtons = document.querySelectorAll('.city-btn');

cityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button state
        cityButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Render stores for selected city
        const city = btn.dataset.city;
        renderStores(city);
    });
});

// Initialize with Moscow stores
renderStores('moscow');

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
const citySelect = document.getElementById('city');
const storeSelect = document.getElementById('store');

// ===== Custom Placeholder System =====
// Uses an absolute positioned span over the select to show placeholder
// This avoids iOS/Desktop quirks with <option hidden>

function updateSelectState(select) {
    const wrapper = select.parentElement;
    if (!wrapper.classList.contains('select-wrapper')) return;

    if (!select.value || select.selectedIndex === -1) {
        wrapper.classList.add('empty');
    } else {
        wrapper.classList.remove('empty');
    }
}

// Function to handle date/time input styling
function updateInputState(input) {
    if (input.value) {
        input.classList.add('has-value');
    } else {
        input.classList.remove('has-value');
    }
}

// Initialize all selects in wrappers
document.querySelectorAll('.select-wrapper select').forEach(select => {
    // Force empty state initially
    select.selectedIndex = -1;
    updateSelectState(select);

    // Update on change
    select.addEventListener('change', () => {
        updateSelectState(select);
    });
});

// Initialize date and time inputs
['date', 'time'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        updateInputState(input);
        input.addEventListener('change', () => updateInputState(input));
        input.addEventListener('input', () => updateInputState(input));
    }
});

// ===== iPad Select Bug Fixes =====
// Detect iPad/iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
              (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

if (isIOS) {
    const allSelects = document.querySelectorAll('.select-wrapper select');
    
    // Bug 1 Fix: Reset selects on orientation change
    window.addEventListener('orientationchange', () => {
        allSelects.forEach(select => {
            select.blur();
        });
        // Force layout recalculation after orientation settles
        setTimeout(() => {
            allSelects.forEach(select => {
                const wrapper = select.parentElement;
                // Trigger reflow
                wrapper.style.display = 'none';
                wrapper.offsetHeight; // Force reflow
                wrapper.style.display = '';
            });
        }, 300);
    });
    
    // Bug 2 Fix: Prevent rapid select switching issues
    // Handle focus explicitly on touchstart
    allSelects.forEach(select => {
        select.addEventListener('touchstart', (e) => {
            // Aggressively blur all other selects to ensure clean state
            // This handles cases where focus might have formally moved to body
            // but the picker state is still resetting
            allSelects.forEach(otherSelect => {
                if (otherSelect !== select) {
                    otherSelect.blur();
                }
            });
        }, { passive: true });
    });
}

// Dynamic Store Selection based on City
function updateStoreOptions() {
    const city = citySelect.value;
    const wrapper = storeSelect.parentElement;
    const placeholderSpan = wrapper.querySelector('.select-placeholder');
    
    // Clear store selection
    storeSelect.innerHTML = '';
    storeSelect.disabled = !city;

    if (city && storesData[city]) {
        storesData[city].forEach(store => {
            const option = document.createElement('option');
            option.value = store.name;
            option.text = store.name;
            storeSelect.appendChild(option);
        });
    }

    // Update placeholder text
    if (placeholderSpan) {
        placeholderSpan.textContent = city ? 'Выберите магазин' : 'Сначала выберите город';
    }

    // Reset selection to empty
    storeSelect.selectedIndex = -1;
    updateSelectState(storeSelect);
}

citySelect.addEventListener('change', updateStoreOptions);

// Initialize stores on load
updateStoreOptions();
// Also force city/packaging to be empty on load
citySelect.selectedIndex = -1;
updateSelectState(citySelect);
document.getElementById('packaging').selectedIndex = -1;
updateSelectState(document.getElementById('packaging'));

// Set minimum date to today and maximum to 2025-12-31
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
dateInput.setAttribute('max', '2025-12-31');

// Custom validation messages for date
dateInput.addEventListener('input', function() {
    // Сбрасываем кастомную ошибку при любом вводе, чтобы проверить заново
    this.setCustomValidity('');
    
    // Проверка ограничений
    if (this.validity.rangeUnderflow) {
        // Если дата меньше min
        this.setCustomValidity('Пожалуйста, выберите дату не раньше сегодняшнего дня.');
        showErrorModal('Пожалуйста, выберите дату не раньше сегодняшнего дня.');
        this.value = ''; // Reset value to force user to pick again
        updateInputState(this);
    } else if (this.validity.rangeOverflow) {
        // Если дата больше max
        this.setCustomValidity('К сожалению, запись на 2026 год пока не открыта.');
        showErrorModal('К сожалению, запись на 2026 год пока не открыта.');
        this.value = ''; // Reset value to force user to pick again
        updateInputState(this);
    }
});


// Также добавляем обработчик invalid, чтобы перехватить сообщение при попытке отправки формы
dateInput.addEventListener('invalid', function() {
    if (this.validity.rangeUnderflow) {
        this.setCustomValidity('Пожалуйста, выберите дату не раньше сегодняшнего дня.');
    } else if (this.validity.rangeOverflow) {
        this.setCustomValidity('К сожалению, запись на 2026 год пока не открыта.');
    } else if (this.validity.valueMissing) {
         this.setCustomValidity('Пожалуйста, выберите дату.');
    }
});

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

    // Time validation
    const citySelect = document.getElementById('city');
    const storeSelect = document.getElementById('store');
    const timeInput = document.getElementById('time');
    
    const selectedCity = citySelect.value;
    const selectedStoreName = storeSelect.value;
    const selectedTime = timeInput.value;

    if (selectedCity && selectedStoreName && selectedTime) {
        const cityStores = storesData[selectedCity];
        const store = cityStores.find(s => s.name === selectedStoreName);
        
        if (store) {
            const time = selectedTime;
            const start = store.hours.start;
            const end = store.hours.end;
            
            // Current time validation
            const selectedDate = document.getElementById('date').value;
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            
            if (selectedDate === todayStr) {
                const currentHours = now.getHours().toString().padStart(2, '0');
                const currentMinutes = now.getMinutes().toString().padStart(2, '0');
                const currentTime = `${currentHours}:${currentMinutes}`;
                
                if (time <= currentTime) {
                    timeInput.blur();
                    showErrorModal('Пожалуйста, выберите время не ранее текущего момента.');
                    
                    timeInput.style.borderColor = '#c41e3a';
                    timeInput.classList.remove('has-value');
                    
                    setTimeout(() => {
                        timeInput.style.borderColor = '';
                    }, 3000);
                    return;
                }
            }

            if (time < start || time > end) {
                // Prevent browser picker from opening immediately if possible (though on submit validation it's handled differently)
                // For input/change event handling:
                timeInput.blur(); // Close picker on mobile/desktop if open
                
                showErrorModal(`Пожалуйста, выберите время в рабочие часы магазина (${store.name}): с ${start} до ${end}`);
                
                // Highlight input
                timeInput.style.borderColor = '#c41e3a';
                timeInput.classList.remove('has-value'); // Make text gray if needed, or keep white? Let's keep value but red border.
                
                // Reset border after some time or on next input
                setTimeout(() => {
                    timeInput.style.borderColor = '';
                }, 3000);
                return;
            }
        }
    }

    // Telegram Bot Settings - ВСТАВЬТЕ СЮДА ВАШИ ДАННЫЕ
    const TOKEN = '8562887595:AAFCEopPa14txyKwlWtjHxixnQYoTr0P27o'; // Например: '123456789:AAH...'
    const CHAT_ID = '-4622183651';  // Например: '-100...'

    // Collect Data
    const packagingSelect = document.getElementById('packaging');
    // citySelect and storeSelect are already defined above
    
    const selectedCityOption = citySelect.options[citySelect.selectedIndex];
    const selectedStoreOption = storeSelect.options[storeSelect.selectedIndex];

    const formData = {
        packaging: packagingSelect.options[packagingSelect.selectedIndex].text,
        city: selectedCityOption.text,
        store: selectedStoreOption.text,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        phone: document.getElementById('phone').value,
        comment: document.getElementById('comment').value || 'Нет комментария'
    };

    // Generate Hashtag from Store Name
    // Removes prefixes like ТЦ/ТРЦ and quotes, replaces spaces with underscores
    const storeHashtag = '#' + formData.store
        .replace(/^(ТЦ|ТРЦ|ТРК)\s*/, '')
        .replace(/[«»"']/g, '')
        .trim()
        .replace(/\s+/g, '_');

    // Format Message
    const message = `
${storeHashtag} <b>Новый заказ!</b>

📦 <b>Упаковка:</b> ${formData.packaging}
🏙 <b>Город:</b> ${formData.city}
🏪 <b>Магазин:</b> ${formData.store}
📅 <b>Дата:</b> ${formData.date}
⏰ <b>Время:</b> ${formData.time}
📱 <b>Телефон:</b> ${formData.phone}
💬 <b>Комментарий:</b> ${formData.comment}
    `;

    // Send to Telegram
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        if (response.ok) {
            // Show success modal
            modal.classList.add('active');
            // Reset form
            orderForm.reset();
            // Reset all selects to empty state
            document.querySelectorAll('.select-wrapper select').forEach(select => {
                select.selectedIndex = -1;
                updateSelectState(select);
            });
            updateStoreOptions();
        } else {
            throw new Error('Telegram API Error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или позвоните нам.');
    });
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

// Error Modal Handlers
const errorModal = document.getElementById('errorModal');
const errorModalClose = document.querySelector('.error-modal-close');
const errorModalBtn = document.querySelector('.error-modal-btn');
const errorModalText = document.getElementById('errorModalText');

function showErrorModal(message) {
    errorModalText.textContent = message;
    errorModal.classList.add('active');
}

function closeErrorModal() {
    errorModal.classList.remove('active');
}

if (errorModalClose) errorModalClose.addEventListener('click', closeErrorModal);
if (errorModalBtn) errorModalBtn.addEventListener('click', closeErrorModal);
if (errorModal) {
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
            closeErrorModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('active')) closeModal();
        if (errorModal && errorModal.classList.contains('active')) closeErrorModal();
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
            } else if (targetId === '#stores') {
                extraOffset = isMobile ? -65 : -60;
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

// ===== Global Focus Management =====
// Сброс фокуса с полей выбора при любом касании экрана (для исправления залипаний на мобильных)
const selectionFieldIds = ['packaging', 'city', 'store', 'date', 'time'];

function handleGlobalFocus(e) {
    // Определяем целевое поле: если клик по label, берём связанный input
    let targetField = e.target;
    if (e.target.tagName === 'LABEL' && e.target.htmlFor) {
        targetField = document.getElementById(e.target.htmlFor);
    }
    
    selectionFieldIds.forEach(id => {
        const field = document.getElementById(id);
        // Снимаем фокус, если поле существует и касание произошло НЕ по этому полю
        if (field && field !== targetField) {
            field.blur();
        }
    });
}

// passive: false для iOS, чтобы работал preventDefault
document.addEventListener('touchstart', handleGlobalFocus, { passive: false, capture: true });
document.addEventListener('mousedown', handleGlobalFocus, { capture: true });
