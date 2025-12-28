// ===== Stores Data =====
const storesData = {
    moscow: [
        {
            name: 'ТЦ «Мега Белая Дача»',
            address: '1-й Покровский пр-д, 5, Котельники',
            hours: { start: '10:00', end: '23:00' },
            openDate: '2025-12-05',
            mapUrl: 'https://yandex.ru/maps/org/15154531028'
        },
        {
            name: 'ТРЦ «Город»',
            address: 'Рязанский пр-т, 2к2',
            hours: { start: '10:00', end: '22:00' },
            openDate: '2025-12-16',
            mapUrl: 'https://yandex.ru/maps/-/CDsaIGKp'
        },
        {
            name: 'ТРЦ «Облака»',
            address: 'Ореховый б-р, д.22 А',
            hours: { start: '10:00', end: '22:00' },
            openDate: '2025-12-18',
            mapUrl: 'https://yandex.ru/maps/-/CDeR5G08'
        },
        {
            name: 'ТРЦ «Косино Парк»',
            address: 'Святоозёрская ул., 1А',
            hours: { start: '10:00', end: '22:00' },
            openDate: '2025-12-17',
            mapUrl: 'https://yandex.ru/maps/-/CDaaqN47'
        }
    ],
    spb: [
        {
            name: 'ТЦ «Галерея»',
            address: 'Лиговский пр., 30А',
            hours: { start: '10:00', end: '23:00' },
            openDate: '2025-12-10',
            mapUrl: 'https://yandex.ru/maps/-/CLUi76Z2'
        },
        {
            name: 'ТЦ «Рио»',
            address: 'Ул. Фучика, д.2',
            hours: { start: '10:00', end: '22:00' },
            openDate: '2025-12-11',
            mapUrl: 'https://yandex.ru/maps/-/CHFWNWnk'
        }
    ]
};

// ===== Stores Rendering =====
function isStoreOpen(store) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const openDate = new Date(store.openDate);
    openDate.setHours(0, 0, 0, 0);
    return today >= openDate;
}

function formatOpenDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
}

function renderStores(city) {
    const storesGrid = document.getElementById('storesGrid');
    const stores = storesData[city] || [];
    
    storesGrid.innerHTML = stores.map(store => {
        const isOpen = isStoreOpen(store);
        const cardClass = isOpen ? 'store-card' : 'store-card not-open';
        const hoursContent = isOpen 
            ? `<p class="store-hours">Ежедневно: ${store.hours.start} — ${store.hours.end}</p>`
            : `<p class="store-opening-date">Работает с ${formatOpenDate(store.openDate)}</p>`;
        
        const cardContent = `
            <div class="${cardClass}">
                <div class="store-icon">📍</div>
                <h3 class="store-name">${store.name}</h3>
                <p class="store-address">${store.address}</p>
                ${hoursContent}
            </div>
        `;
        
        // Wrap in link only if mapUrl exists
        if (store.mapUrl) {
            return `<a href="${store.mapUrl}" target="_blank" rel="noopener noreferrer" class="store-card-link">${cardContent}</a>`;
        }
        return cardContent;
    }).join('');
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


// ===== Form Handling =====
const orderForm = document.getElementById('orderForm');
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
            option.dataset.openDate = store.openDate;
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

// Get selected store's open date
function getSelectedStoreOpenDate() {
    const selectedOption = storeSelect.options[storeSelect.selectedIndex];
    return selectedOption ? selectedOption.dataset.openDate : null;
}

// Check if selected date is valid for selected store
function validateDateForStore() {
    const selectedDate = dateInput.value;
    const openDate = getSelectedStoreOpenDate();
    
    if (!selectedDate || !openDate) return true;
    
    if (selectedDate < openDate) {
        const storeName = storeSelect.value;
        const formattedDate = formatOpenDate(openDate);
        showErrorModal(`Магазин ${storeName} открывается ${formattedDate}. Пожалуйста, выберите дату не раньше ${formattedDate}.`);
        dateInput.value = '';
        updateInputState(dateInput);
        return false;
    }
    return true;
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
    this.setCustomValidity('');
});

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

const validationEvent = isMobile ? 'blur' : 'change';

dateInput.addEventListener(validationEvent, function() {
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
    } else {
        // Проверка даты открытия магазина
        validateDateForStore();
    }
});

// Validate date when store selection changes
storeSelect.addEventListener('change', function() {
    if (dateInput.value) {
        validateDateForStore();
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

    // Store open date validation
    if (!validateDateForStore()) {
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
    const CHAT_ID = '-1003328165794';  // Супергруппа "Заказы с сайта"

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
            //Redirect to thanks page
            window.location.href = 'thanks.html';
            // Reset form
            orderForm.reset();
            // Reset all selects to empty state
            document.querySelectorAll('.select-wrapper select').forEach(select => {
                select.selectedIndex = -1;
                updateSelectState(select);
            });
            // Reset date and time inputs visual state
            ['date', 'time'].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    updateInputState(input);
                }
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

// Close error modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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
