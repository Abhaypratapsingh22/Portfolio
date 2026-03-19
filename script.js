/* ============================================================
   PORTFOLIO — Premium Redesign Script
   Particles • Typewriter • Scroll Reveal • Filter • Theme
   ============================================================ */

(function () {
    'use strict';

    // ---- Reduced Motion Check ----
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- DOM Cache ----
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const navbar = $('#navbar');
    const navToggle = $('#nav-toggle');
    const navMenu = $('#nav-menu');
    const navLinks = $$('.nav-link');

    // ============================================================
    //  DARK / LIGHT THEME TOGGLE
    // ============================================================
    function initThemeToggle() {
        const toggle = $('#theme-toggle');
        const icon = $('#theme-icon');
        if (!toggle || !icon) return;

        // Apply saved preference
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
        }

        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Re-draw particles with correct color if active
            if (typeof reinitParticles === 'function') reinitParticles();
        });
    }

    // ============================================================
    //  HERO CANVAS — Cinematic AI Background
    //  Layer 1: Plasma sine waves
    //  Layer 2: Neural brain network with signal pulses
    //  Layer 3: Matrix binary rain
    // ============================================================
    let particleAnimId;
    let reinitParticles;

    function initParticles() {
        const canvas = $('#hero-particles');
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        let W, H;
        let mouse = { x: -9999, y: -9999 };

        // ---- Color helpers ----
        function getAccent() {
            return document.body.classList.contains('dark-mode')
                ? { r: 6, g: 182, b: 212 }      // cyan
                : { r: 108, g: 99, b: 255 };    // purple
        }
        function ac(a) {
            const c = getAccent();
            return `rgba(${c.r},${c.g},${c.b},${a})`;
        }
        function acHex() {
            const c = getAccent();
            return `rgb(${c.r},${c.g},${c.b})`;
        }

        // ---- Resize ----
        function resize() {
            W = canvas.width  = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
            init();
        }

        // ========================================================
        // LAYER 1: Plasma sine waves (background depth effect)
        // ========================================================
        const waves = [];
        function buildWaves() {
            waves.length = 0;
            const count = 7;
            for (let i = 0; i < count; i++) {
                waves.push({
                    amp:    H * (0.06 + Math.random() * 0.12),
                    freq:   0.002 + Math.random() * 0.004,
                    speed:  0.003 + Math.random() * 0.005,
                    yBase:  H * (0.15 + (i / count) * 0.72),
                    phase:  Math.random() * Math.PI * 2,
                    alpha:  0.08 + Math.random() * 0.10
                });
            }
        }

        function drawWaves(t) {
            for (const w of waves) {
                ctx.beginPath();
                ctx.moveTo(0, H);
                for (let x = 0; x <= W; x += 2) {
                    const y = w.yBase + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp
                            + Math.sin(x * w.freq * 2.3 - t * w.speed * 0.8) * w.amp * 0.5;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(W, H);
                ctx.closePath();
                const grad = ctx.createLinearGradient(0, 0, W, 0);
                grad.addColorStop(0,   ac(0));
                grad.addColorStop(0.3, ac(w.alpha * 0.6));
                grad.addColorStop(0.5, ac(w.alpha));
                grad.addColorStop(0.7, ac(w.alpha * 0.6));
                grad.addColorStop(1,   ac(0));
                ctx.fillStyle = grad;
                ctx.fill();
                // also draw a stroke for the wave edge
                ctx.beginPath();
                ctx.moveTo(0, w.yBase + Math.sin(w.phase) * w.amp);
                for (let x = 0; x <= W; x += 2) {
                    const y = w.yBase + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp
                            + Math.sin(x * w.freq * 2.3 - t * w.speed * 0.8) * w.amp * 0.5;
                    ctx.lineTo(x, y);
                }
                ctx.strokeStyle = ac(w.alpha * 1.5);
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // ========================================================
        // LAYER 2: Neural network with animated signal pulses
        // ========================================================
        let nodes = [], links = [], pulses = [];

        function buildNetwork() {
            nodes = []; links = []; pulses = [];
            const count = Math.min(Math.floor((W * H) / 10000), 120);
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x:          Math.random() * W,
                    y:          Math.random() * H,
                    vx:         (Math.random() - 0.5) * 0.4,
                    vy:         (Math.random() - 0.5) * 0.4,
                    r:          Math.random() * 3 + 1.5,
                    isHub:      Math.random() > 0.80,
                    pulse:      Math.random() * Math.PI * 2,
                    pulseSpeed: 0.025 + Math.random() * 0.035
                });
            }
            buildLinks();
        }

        function buildLinks() {
            links = [];
            const maxDist = Math.min(W, H) * 0.28;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    if (Math.hypot(dx, dy) < maxDist) links.push([i, j]);
                }
            }
        }

        function spawnPulse() {
            if (links.length === 0) return;
            const lnk = links[Math.floor(Math.random() * links.length)];
            pulses.push({ link: lnk, t: 0, speed: 0.006 + Math.random() * 0.01 });
        }

        function updateNetwork() {
            const maxDist = Math.min(W, H) * 0.22;
            for (const n of nodes) {
                // Mouse repulsion
                const dx = n.x - mouse.x, dy = n.y - mouse.y;
                const d = Math.hypot(dx, dy);
                if (d < 120) {
                    const f = (120 - d) / 120 * 1.5;
                    n.vx += (dx / d) * f * 0.05;
                    n.vy += (dy / d) * f * 0.05;
                }
                // Friction
                n.vx *= 0.99; n.vy *= 0.99;
                // Speed cap
                const spd = Math.hypot(n.vx, n.vy);
                if (spd > 0.8) { n.vx = n.vx / spd * 0.8; n.vy = n.vy / spd * 0.8; }

                n.x += n.vx; n.y += n.vy;
                if (n.x < 0) { n.x = 0; n.vx *= -1; }
                if (n.x > W) { n.x = W; n.vx *= -1; }
                if (n.y < 0) { n.y = 0; n.vy *= -1; }
                if (n.y > H) { n.y = H; n.vy *= -1; }
                n.pulse += n.pulseSpeed;
            }

            // Rebuild links periodically (every ~3s)
            if (Math.random() < 0.003) buildLinks();

            // Spawn pulses more frequently
            if (Math.random() < 0.12) spawnPulse();
            pulses = pulses.filter(p => (p.t += p.speed) < 1);
        }

        function drawNetwork() {
            const maxDist = Math.min(W, H) * 0.28;

            // Links — brighter and wider
            for (const [i, j] of links) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                const alpha = 0.38 * (1 - dist / maxDist);
                ctx.beginPath();
                ctx.strokeStyle = ac(alpha);
                ctx.lineWidth = 0.9;
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }

            // Signal pulses — much bigger and brighter
            for (const p of pulses) {
                const [i, j] = p.link;
                const a = nodes[i], b = nodes[j];
                const px = a.x + (b.x - a.x) * p.t;
                const py = a.y + (b.y - a.y) * p.t;
                // outer glow
                const grd = ctx.createRadialGradient(px, py, 0, px, py, 18);
                grd.addColorStop(0,   ac(1.0));
                grd.addColorStop(0.3, ac(0.6));
                grd.addColorStop(1,   ac(0));
                ctx.beginPath();
                ctx.arc(px, py, 18, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
                // bright core
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fillStyle = ac(1.0);
                ctx.fill();
            }

            // Nodes — brighter
            for (const n of nodes) {
                const s = Math.sin(n.pulse) * 0.5 + 0.5;
                if (n.isHub) {
                    // Hub: large glowing halo
                    const hGrd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9 + s * 6);
                    hGrd.addColorStop(0,   ac(0.7 + s * 0.3));
                    hGrd.addColorStop(0.35, ac(0.35));
                    hGrd.addColorStop(1,   ac(0));
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 9 + s * 6, 0, Math.PI * 2);
                    ctx.fillStyle = hGrd;
                    ctx.fill();
                    // solid bright core
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = ac(1.0);
                    ctx.fill();
                } else {
                    // normal node — visible glow + core
                    const nGrd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
                    nGrd.addColorStop(0, ac(0.6 + s * 0.2));
                    nGrd.addColorStop(1, ac(0));
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
                    ctx.fillStyle = nGrd;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = ac(0.7 + s * 0.3);
                    ctx.fill();
                }
            }
        }

        // ========================================================
        // LAYER 3: Matrix binary rain (subtle, right-side bias)
        // ========================================================
        const FONT_SIZE = 13;
        let cols = [], drops = [], matrixChars;

        function buildMatrix() {
            matrixChars = '01アイウエオカキクケコサシスセソタチツテト∑∈∇∂∞≈≡'.split('');
            cols = Math.ceil(W / FONT_SIZE);
            drops = Array.from({ length: cols }, () => Math.random() * -50);
        }

        function drawMatrix() {
            ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
            ctx.textAlign = 'left';
            for (let i = 0; i < cols; i++) {
                const x = i * FONT_SIZE;
                const bias = x / W;
                // full screen coverage: stronger on right, lighter on left
                const maxAlpha = bias > 0.60 ? 0.55 : (bias > 0.30 ? 0.35 : 0.20);
                const ch = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                const y = drops[i] * FONT_SIZE;
                // trail character
                ctx.fillStyle = ac(maxAlpha * (0.4 + Math.random() * 0.5));
                ctx.fillText(ch, x, y);
                // bright leading "head" character
                if (y > 0 && y < H) {
                    ctx.fillStyle = ac(Math.min(maxAlpha * 3, 1.0));
                    ctx.fillText(ch, x, y);
                }
                if (y > H + Math.random() * 500) drops[i] = 0;
                drops[i] += 0.5;
            }
        }

        // ========================================================
        // Main init and loop
        // ========================================================
        function init() {
            buildWaves();
            buildNetwork();
            buildMatrix();
        }

        function draw(timestamp) {
            const t = timestamp || 0;
            ctx.clearRect(0, 0, W, H);

            // L1: Plasma waves
            drawWaves(t);

            // L2: Neural network
            updateNetwork();
            drawNetwork();

            // L3: Matrix rain (only in dark mode)
            if (document.body.classList.contains('dark-mode')) drawMatrix();

            particleAnimId = requestAnimationFrame(draw);
        }

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

        window.addEventListener('resize', () => {
            resize();
        });

        resize();
        particleAnimId = requestAnimationFrame(draw);

        reinitParticles = () => {
            cancelAnimationFrame(particleAnimId);
            resize();
        };
    }

    // ============================================================
    //  TYPEWRITER EFFECT
    // ============================================================
    function initTypewriter() {
        const el = $('#typed-subtitle');
        if (!el) return;

        const phrases = [
            'Computer Science Engineer',
            'Data Analyst',
            'Machine Learning Enthusiast',
            'Problem Solver'
        ];

        if (prefersReducedMotion) {
            el.textContent = phrases[0];
            const cursor = $('.typed-cursor');
            if (cursor) cursor.style.display = 'none';
            return;
        }

        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typeSpeed = 80;

        function tick() {
            const current = phrases[phraseIdx];

            if (isDeleting) {
                el.textContent = current.substring(0, charIdx - 1);
                charIdx--;
                typeSpeed = 40;
            } else {
                el.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                typeSpeed = 90;
            }

            if (!isDeleting && charIdx === current.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typeSpeed = 400;
            }

            setTimeout(tick, typeSpeed);
        }

        setTimeout(tick, 800);
    }

    // ============================================================
    //  MULTILINGUAL GREETING TYPEWRITER
    // ============================================================
    function initGreetingTypewriter() {
        const el = $('#greeting-text');
        if (!el) return;

        const greetings = [
            'Hello',
            'Namaste',
            'Hola',
            'Bonjour',
            'Salaam',
            'வணக்கம்',
            '你好'
        ];

        if (prefersReducedMotion) {
            el.textContent = greetings[0];
            const cursor = $('.greeting-cursor');
            if (cursor) cursor.style.display = 'none';
            return;
        }

        let greetIdx = 0;
        let charIdx = greetings[0].length; // start fully typed
        let isDeleting = false;
        let speed = 100;
        let pauseAfterType = 2500;

        function tick() {
            const current = greetings[greetIdx];

            if (isDeleting) {
                // Use Array.from for multi-byte character support (e.g. Chinese, Tamil)
                const chars = Array.from(current);
                charIdx--;
                el.textContent = chars.slice(0, charIdx).join('');
                speed = 50;
            } else {
                const chars = Array.from(current);
                charIdx++;
                el.textContent = chars.slice(0, charIdx).join('');
                speed = 100;
            }

            const chars = Array.from(current);
            if (!isDeleting && charIdx >= chars.length) {
                speed = pauseAfterType;
                isDeleting = true;
            } else if (isDeleting && charIdx <= 0) {
                isDeleting = false;
                greetIdx = (greetIdx + 1) % greetings.length;
                charIdx = 0;
                speed = 300;
            }

            setTimeout(tick, speed);
        }

        // Start with initial pause before first delete
        setTimeout(() => {
            isDeleting = true;
            tick();
        }, pauseAfterType);
    }

    // ============================================================
    //  NAVIGATION
    // ============================================================
    function initNav() {
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = $(this.getAttribute('href'));
                if (target) {
                    const offset = target.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top: offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        }, { passive: true });
    }

    // ============================================================
    //  ACTIVE SECTION INDICATOR
    // ============================================================
    function initActiveSection() {
        const sections = $$('section[id]');

        function updateActiveLink() {
            let currentId = '';

            // Use getBoundingClientRect for accurate viewport-relative positions
            // The section whose top is at or above 100px from viewport top wins
            for (let i = 0; i < sections.length; i++) {
                const rect = sections[i].getBoundingClientRect();
                if (rect.top <= 100) {
                    currentId = sections[i].getAttribute('id');
                }
            }

            // Handle edge case: at very top of page
            if (!currentId && window.scrollY < 100) {
                currentId = 'home';
            }

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
            });
        }

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink(); // set initial state
    }

    // ============================================================
    //  SCROLL REVEAL
    // ============================================================
    function initScrollReveal() {
        if (prefersReducedMotion) {
            $$('.reveal-item').forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        $$('.reveal-item').forEach(el => observer.observe(el));
    }

    // ============================================================
    //  PROJECT FILTER
    // ============================================================
    function initProjectFilter() {
        const chips = $$('.filter-chip');
        const cards = $$('.project-card');

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const filter = chip.dataset.filter;

                cards.forEach(card => {
                    const category = card.dataset.category;
                    const shouldShow = filter === 'all' || category === filter;

                    if (shouldShow) {
                        card.classList.remove('hidden');
                        card.style.position = '';
                        card.style.visibility = '';
                    } else {
                        card.classList.add('hidden');
                        setTimeout(() => {
                            if (card.classList.contains('hidden')) {
                                card.style.position = 'absolute';
                                card.style.visibility = 'hidden';
                            }
                        }, 400);
                    }
                });
            });
        });
    }

    // ============================================================
    //  COUNTER ANIMATION (About stats)
    // ============================================================
    function initCounters() {
        if (prefersReducedMotion) {
            $$('.counter').forEach(c => { c.textContent = c.dataset.target + '+'; });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target);
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            el.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.ceil(current) + '+';
                        }
                    }, 40);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        $$('.counter').forEach(el => observer.observe(el));
    }

    // ============================================================
    //  CONTACT FORM
    // ============================================================
    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = Object.fromEntries(new FormData(form));
            const { name, email, subject, message } = data;

            if (!name || !email || !subject || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast('Please enter a valid email', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
                form.reset();
                btn.innerHTML = original;
                btn.disabled = false;
            }, 1500);
        });
    }

    // ============================================================
    //  TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;

        const colors = { success: '#10b981', error: '#ef4444', info: '#6C63FF' };

        Object.assign(toast.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '14px 24px',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.92rem',
            zIndex: '10000',
            transform: 'translateX(120%)',
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            maxWidth: '360px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            background: colors[type] || colors.info
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // ============================================================
    //  PARALLAX — Hero content
    // ============================================================
    function initParallax() {
        if (prefersReducedMotion) return;

        const heroContent = $('.hero-content');
        if (!heroContent) return;

        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
                heroContent.style.transform = `translateY(${y * 0.35}px)`;
                heroContent.style.opacity = Math.max(1 - y / 600, 0);
            }
        }, { passive: true });
    }

    // ============================================================
    //  FLIP CARDS — Touch support (tap to flip on mobile)
    // ============================================================
    function initFlipTouch() {
        if (window.matchMedia('(hover: hover)').matches) return;

        $$('.flip-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.flip-card.is-flipped').forEach(c => {
                    if (c !== card) c.classList.remove('is-flipped');
                });
                card.classList.toggle('is-flipped');
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
            @media (hover: none) { .flip-card:hover .flip-card-inner { transform: none; } }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    //  INIT
    // ============================================================
    function init() {
        initThemeToggle();
        initParticles();
        initTypewriter();
        initGreetingTypewriter();
        initNav();
        initActiveSection();
        initScrollReveal();
        initProjectFilter();
        initCounters();
        initContactForm();
        initParallax();
        initFlipTouch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Console branding
    console.log(
        '%c APS Portfolio %c Premium Edition ',
        'background: #6C63FF; color: #fff; font-size: 14px; padding: 6px 12px; border-radius: 4px 0 0 4px;',
        'background: #18181b; color: #a1a1aa; font-size: 14px; padding: 6px 12px; border-radius: 0 4px 4px 0;'
    );

})();
