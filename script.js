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
    //  PARTICLE CANVAS — lightweight dot-and-line system
    // ============================================================
    let particleAnimId;
    let reinitParticles;

    function initParticles() {
        const canvas = $('#hero-particles');
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        let W, H;
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        function resize() {
            W = canvas.width = canvas.parentElement.offsetWidth;
            H = canvas.height = canvas.parentElement.offsetHeight;
        }

        function createParticles() {
            const count = Math.min(Math.floor((W * H) / 12000), 100);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    r: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(108, 99, 255, ${0.15 * (1 - dist / 140)})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Dots
            for (const p of particles) {
                if (mouse.x !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        p.x += dx / dist * force * 2;
                        p.y += dy / dist * force * 2;
                    }
                }

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
                ctx.fill();
            }

            particleAnimId = requestAnimationFrame(draw);
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        resize();
        createParticles();
        draw();

        reinitParticles = () => {
            cancelAnimationFrame(particleAnimId);
            resize();
            createParticles();
            draw();
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
