/**
 * Medvandrerne Admin Panel - Professional UI/UX
 * Minimal cognitive load, maximum delight
 */

// ============================================
// Confetti System - Celebration!
// ============================================
const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    colors: ['#E53935', '#00C853', '#2979FF', '#FFB300', '#7C4DFF'],
    
    init() {
        if (this.canvas) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticle(x, y) {
        return {
            x,
            y,
            vx: (Math.random() - 0.5) * 20,
            vy: -Math.random() * 25 - 10,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.5,
            opacity: 1
        };
    },
    
    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 50) {
        this.init();
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        this.animate();
    },
    
    animate() {
        if (this.particles.length === 0) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((p, i) => {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.01;
            
            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
                return;
            }
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();
        });
        
        requestAnimationFrame(() => this.animate());
    }
};

// ============================================
// Animated Counter
// ============================================
const AnimatedCounter = {
    animate(element, target, duration = 1000) {
        const start = 0;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const current = Math.round(start + (target - start) * eased);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },
    
    initAll() {
        document.querySelectorAll('.stat-value[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            if (!isNaN(target)) {
                el.textContent = '0';
                setTimeout(() => this.animate(el, target, 800), 200);
            }
        });
    }
};

// ============================================
// Theme Manager
// ============================================
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('theme') || 'light';
        this.set(saved);
        this.createToggle();
    },
    
    set(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon();
    },
    
    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        this.set(current === 'dark' ? 'light' : 'dark');
    },
    
    createToggle() {
        if (document.querySelector('.theme-toggle')) return;
        
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Bytt tema');
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
        this.updateIcon();
    },
    
    updateIcon() {
        const btn = document.querySelector('.theme-toggle');
        if (!btn) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        btn.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
};

// ============================================
// Toast Notifications - Minimal
// ============================================
const Toast = {
    container: null,
    
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'success', duration = 3000) {
        this.init();
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        // Auto dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.95)';
            setTimeout(() => toast.remove(), 200);
        }, duration);
        
        return toast;
    },
    
    success(msg) { return this.show(msg, 'success'); },
    error(msg) { return this.show(msg, 'error'); },
    warning(msg) { return this.show(msg, 'warning'); },
    info(msg) { return this.show(msg, 'info'); }
};

// ============================================
// Save Data with Delight
// ============================================
async function saveData(type, data) {
    const form = document.activeElement?.closest('form');
    const btn = form?.querySelector('button[type="submit"]');
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Lagrer...';
    }
    
    try {
        const response = await fetch('api/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const text = await response.text();
        if (!text.trim()) throw new Error('Tom respons');
        
        const result = JSON.parse(text);
        
        if (result.success) {
            Toast.success('Lagret!');
            
            // Confetti celebration
            if (btn) {
                const rect = btn.getBoundingClientRect();
                Confetti.burst(rect.left + rect.width / 2, rect.top, 30);
            }
            
            // Reload after delay
            setTimeout(() => {
                const url = new URL(window.location);
                url.searchParams.set('_t', Date.now());
                window.location.href = url.toString();
            }, 800);
            
            return true;
        } else {
            throw new Error(result.error || 'Ukjent feil');
        }
    } catch (error) {
        Toast.error(error.message || 'Kunne ikke lagre');
        
        // Shake the form on error
        if (form) {
            form.style.animation = 'shake 0.4s ease';
            setTimeout(() => form.style.animation = '', 400);
        }
        
        return false;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-save"></i> Lagre';
        }
    }
}

// Legacy compatibility
function showNotification(message, type = 'success') {
    Toast.show(message, type);
}

// ============================================
// Modal Manager
// ============================================
const Modal = {
    current: null,
    
    open(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        
        this.close();
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.current = modal;
        
        // Focus first input
        setTimeout(() => {
            const input = modal.querySelector('input, textarea, select');
            if (input) input.focus();
        }, 100);
    },
    
    close(id = null) {
        const modal = id ? document.getElementById(id) : this.current;
        if (!modal) return;
        
        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.current = null;
    }
};

// ============================================
// Keyboard Shortcuts
// ============================================
const Shortcuts = {
    overlay: null,
    
    init() {
        this.createOverlay();
        
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            
            // ? = Show shortcuts
            if (e.key === '?') {
                e.preventDefault();
                this.toggle();
            }
            
            // Escape = Close modals/overlay
            if (e.key === 'Escape') {
                this.hide();
                Modal.close();
            }
            
            // Ctrl/Cmd + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
            
            // Ctrl/Cmd + K = Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.querySelector('.search-box input');
                if (search) search.focus();
            }
        });
    },
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'shortcuts-overlay';
        this.overlay.innerHTML = `
            <div class="shortcuts-content">
                <h2>
                    Tastatursnarveier
                    <button class="btn-icon" onclick="Shortcuts.hide()">
                        <i class="fas fa-times"></i>
                    </button>
                </h2>
                <div class="shortcut-item">
                    <span>Lagre</span>
                    <span class="shortcut-key">⌘S</span>
                </div>
                <div class="shortcut-item">
                    <span>Søk</span>
                    <span class="shortcut-key">⌘K</span>
                </div>
                <div class="shortcut-item">
                    <span>Lukk</span>
                    <span class="shortcut-key">Esc</span>
                </div>
                <div class="shortcut-item">
                    <span>Snarveier</span>
                    <span class="shortcut-key">?</span>
                </div>
            </div>
        `;
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
        
        document.body.appendChild(this.overlay);
    },
    
    show() {
        this.overlay?.classList.add('show');
    },
    
    hide() {
        this.overlay?.classList.remove('show');
    },
    
    toggle() {
        this.overlay?.classList.toggle('show');
    }
};

// ============================================
// Table Manager - Search & Sort
// ============================================
const Table = {
    init(table) {
        if (!table) return;
        
        // Add search
        const wrapper = table.closest('.data-table');
        if (wrapper && !wrapper.querySelector('.data-table-header')) {
            const header = document.createElement('div');
            header.className = 'data-table-header';
            header.innerHTML = `
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Søk..." 
                           oninput="Table.search(this.value, this.closest('.data-table').querySelector('table'))">
                </div>
            `;
            wrapper.insertBefore(header, table);
        }
    },
    
    search(query, table) {
        if (!table) return;
        const rows = table.querySelectorAll('tbody tr');
        const q = query.toLowerCase();
        
        rows.forEach(row => {
            const match = row.textContent.toLowerCase().includes(q);
            row.style.display = match ? '' : 'none';
        });
    }
};

// ============================================
// Form Validation
// ============================================
const Validate = {
    init(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.check(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) this.check(input);
            });
        });
        
        form.addEventListener('submit', (e) => {
            let valid = true;
            inputs.forEach(input => {
                if (!this.check(input)) valid = false;
            });
            
            if (!valid) {
                e.preventDefault();
                Toast.error('Fyll ut alle påkrevde felt');
            }
        });
    },
    
    check(input) {
        const valid = input.checkValidity();
        input.classList.toggle('error', !valid);
        return valid;
    }
};

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Theme
    ThemeManager.init();
    
    // Shortcuts
    Shortcuts.init();
    
    // Animate counters
    AnimatedCounter.initAll();
    
    // Tables
    document.querySelectorAll('.data-table table').forEach(t => Table.init(t));
    
    // Forms
    document.querySelectorAll('form').forEach(form => {
        Validate.init(form);
        
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.dataset.originalText = btn.innerHTML;
    });
    
    // Close modals on backdrop click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) Modal.close();
    });
    
    // Add entrance animations to cards
    document.querySelectorAll('.stat-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + i * 50);
    });
});

// ============================================
// Exports
// ============================================
window.Modal = Modal;
window.Toast = Toast;
window.ToastManager = Toast; // Legacy
window.ModalManager = Modal; // Legacy
window.Confetti = Confetti;
window.Table = Table;
window.Shortcuts = Shortcuts;
window.saveData = saveData;
window.showNotification = showNotification;

