/* ========================================
   Portfolio JavaScript
   Interactive Canvas Animations & UI Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initSpiralCanvas();
    initKnowledgeGraph();
    initExploringCanvas();
    initScrollAnimations();
    initNavigation();
    initTypingEffect();
});

/* ========================================
   Spiral Galaxy Canvas (Hero Section)
   ======================================== */
function initSpiralCanvas() {
    const canvas = document.getElementById('spiralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    function drawSpiral() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // Draw spiral arms
        for (let arm = 0; arm < 3; arm++) {
            const armOffset = (arm * Math.PI * 2) / 3;

            ctx.beginPath();
            for (let i = 0; i < 200; i++) {
                const t = i / 200;
                const angle = t * Math.PI * 4 + armOffset + time * 0.3;
                const radius = t * Math.min(w, h) * 0.42;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.08 + arm * 0.03})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw particles along spiral
        for (let i = 0; i < 60; i++) {
            const t = (i / 60 + time * 0.02) % 1;
            const arm = i % 3;
            const armOffset = (arm * Math.PI * 2) / 3;
            const angle = t * Math.PI * 4 + armOffset + time * 0.3;
            const radius = t * Math.min(w, h) * 0.42;
            const x = cx + Math.cos(angle) * radius + Math.sin(time + i) * 2;
            const y = cy + Math.sin(angle) * radius + Math.cos(time + i) * 2;

            const size = 1 + Math.sin(time + i * 0.5) * 0.5;
            const alpha = 0.3 + t * 0.5;

            const colors = ['#22d3ee', '#3b82f6', '#a78bfa', '#34d399', '#fbbf24'];
            const color = colors[i % colors.length];

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);

            // Convert hex to rgba
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();
        }

        // Center glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.15)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();

        time += 0.01;
        requestAnimationFrame(drawSpiral);
    }

    drawSpiral();
}

/* ========================================
   Knowledge Graph Canvas
   ======================================== */
function initKnowledgeGraph() {
    const canvas = document.getElementById('knowledgeGraph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    // Knowledge domains — reflects the data / AI / markets focus.
    const nodes = [
        { label: 'Systems\nThinking', desc: 'how everything connects', r: 40, color: '#22d3ee', core: true },
        { label: 'AI', desc: 'LLMs · Agents · ML', r: 26, color: '#3b82f6' },
        { label: 'Data', desc: 'Python · SQL · ETL', r: 26, color: '#22d3ee' },
        { label: 'Markets', desc: 'Trading · Macro', r: 24, color: '#fb923c' },
        { label: 'Statistics', desc: 'Probability · Inference', r: 23, color: '#a78bfa' },
        { label: 'Engineering', desc: 'Pipelines · Infra', r: 24, color: '#34d399' },
        { label: 'Economics', desc: 'Incentives · Systems', r: 22, color: '#fbbf24' },
        { label: 'Psychology', desc: 'Behaviour · Bias', r: 22, color: '#f472b6' },
        { label: 'Viz', desc: 'Power BI · Tableau', r: 21, color: '#f87171' },
    ];

    // Edges between node indices.
    const connections = [
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
        [1, 2], [2, 5], [2, 8], [2, 4], [1, 4], [3, 6], [3, 7], [4, 7], [5, 6], [4, 8]
    ];

    // Adjacency map for hover highlighting.
    const adj = nodes.map(() => new Set());
    connections.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hexToRgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

    let W = 0, H = 0, time = 0;
    let mouseX = -1, mouseY = -1, hoverIdx = -1, dragIdx = -1;

    nodes.forEach(n => { n.x = 0; n.y = 0; n.vx = 0; n.vy = 0; n.hx = 0; n.hy = 0; });

    // Compute "home" positions: core centred, domains on a ring.
    function layout() {
        W = canvas.width / dpr; H = canvas.height / dpr;
        const cx = W / 2, cy = H / 2;
        const ring = Math.min(W, H) * 0.34;
        nodes[0].hx = cx; nodes[0].hy = cy;
        const domains = nodes.length - 1;
        for (let i = 1; i < nodes.length; i++) {
            const a = ((i - 1) / domains) * Math.PI * 2 - Math.PI / 2;
            nodes[i].hx = cx + Math.cos(a) * ring;
            nodes[i].hy = cy + Math.sin(a) * ring * 0.92;
        }
        nodes.forEach(n => { if (n.x === 0 && n.y === 0) { n.x = n.hx; n.y = n.hy; } });
    }

    function resizeAll() { resize(); layout(); }
    layout();
    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resizeAll);

    function pointer(e) {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    function nearest(px, py) {
        let idx = -1, best = Infinity;
        nodes.forEach((n, i) => {
            const d = Math.hypot(px - n.x, py - n.y);
            if (d < n.r + 8 && d < best) { best = d; idx = i; }
        });
        return idx;
    }

    canvas.addEventListener('mousemove', (e) => {
        const p = pointer(e); mouseX = p.x; mouseY = p.y;
        if (dragIdx >= 0) {
            const n = nodes[dragIdx]; n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0;
            canvas.style.cursor = 'grabbing';
        } else {
            hoverIdx = nearest(p.x, p.y);
            canvas.style.cursor = hoverIdx >= 0 ? 'grab' : 'default';
        }
    });
    canvas.addEventListener('mouseleave', () => { mouseX = -1; mouseY = -1; hoverIdx = -1; });
    canvas.addEventListener('mousedown', (e) => {
        const p = pointer(e); const i = nearest(p.x, p.y);
        if (i >= 0) { dragIdx = i; canvas.style.cursor = 'grabbing'; }
    });
    window.addEventListener('mouseup', () => { dragIdx = -1; });

    // Physics: spring each node to its home, repel from the cursor, damp.
    function step() {
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (i === dragIdx) continue;
            const driftX = reduceMotion ? 0 : Math.sin(time * 0.6 + i * 1.3) * 2.2;
            const driftY = reduceMotion ? 0 : Math.cos(time * 0.5 + i * 0.9) * 2.2;
            n.vx += (n.hx + driftX - n.x) * 0.02;
            n.vy += (n.hy + driftY - n.y) * 0.02;
            if (!reduceMotion && mouseX >= 0 && dragIdx < 0) {
                const dx = n.x - mouseX, dy = n.y - mouseY, d = Math.hypot(dx, dy);
                if (d < 90 && d > 0.001) { const f = (90 - d) / 90 * 1.6; n.vx += dx / d * f; n.vy += dy / d * f; }
            }
            n.vx *= 0.86; n.vy *= 0.86;
            n.x += n.vx; n.y += n.vy;
        }
    }

    function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    }

    function drawGraph() {
        if (W === 0) layout();
        ctx.clearRect(0, 0, W, H);
        step();

        const hovering = hoverIdx >= 0;
        const isLit = (i) => !hovering || i === hoverIdx || adj[hoverIdx].has(i);

        // Edges with gradient + flowing particle.
        connections.forEach(([a, b]) => {
            const pa = nodes[a], pb = nodes[b];
            const lit = !hovering || a === hoverIdx || b === hoverIdx;
            const [ra, ga, ba] = hexToRgb(pa.color), [rb, gb, bb] = hexToRgb(pb.color);
            const ea = lit ? 0.45 : 0.05;
            const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            grad.addColorStop(0, `rgba(${ra}, ${ga}, ${ba}, ${ea})`);
            grad.addColorStop(1, `rgba(${rb}, ${gb}, ${bb}, ${ea})`);
            ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = grad; ctx.lineWidth = lit ? 1.6 : 1; ctx.stroke();

            if (!reduceMotion) {
                const tt = (time * 0.25 + a * 0.3 + b * 0.2) % 1;
                const px = pa.x + (pb.x - pa.x) * tt, py = pa.y + (pb.y - pa.y) * tt;
                ctx.beginPath(); ctx.arc(px, py, lit ? 2 : 1.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(226, 232, 240, ${lit ? 0.7 : 0.2})`; ctx.fill();
            }
        });

        // Nodes.
        nodes.forEach((n, i) => {
            const [r, g, b] = hexToRgb(n.color);
            const lit = isLit(i), hov = i === hoverIdx;
            const R = n.r * (hov ? 1.12 : (lit ? 1 : 0.96));
            const alpha = lit ? 1 : 0.4;

            if (n.core || hov || (hovering && lit)) {
                const gg = ctx.createRadialGradient(n.x, n.y, R * 0.4, n.x, n.y, R * 2);
                gg.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${hov ? 0.28 : 0.16})`);
                gg.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.beginPath(); ctx.arc(n.x, n.y, R * 2, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
            }
            if (n.core && !reduceMotion) {
                const pr = R + 6 + Math.sin(time * 2) * 3;
                ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.18)`; ctx.lineWidth = 1; ctx.stroke();
            }
            ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(n.core ? 0.16 : 0.12) * alpha + 0.02})`; ctx.fill();
            ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(hov ? 0.9 : 0.4) * alpha})`;
            ctx.lineWidth = hov ? 2 : 1.2; ctx.stroke();

            ctx.fillStyle = lit ? n.color : `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.font = `${n.core ? '600' : '500'} ${n.core ? 12 : 10}px 'Inter', sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const lines = n.label.split('\n'), lh = n.core ? 14 : 12;
            const sy = n.y - ((lines.length - 1) * lh) / 2;
            lines.forEach((ln, li) => ctx.fillText(ln, n.x, sy + li * lh));
        });

        // Tooltip on the hovered node.
        if (hovering && nodes[hoverIdx].desc) {
            const n = nodes[hoverIdx], txt = nodes[hoverIdx].desc;
            ctx.font = `500 11px 'JetBrains Mono', monospace`;
            const bw = ctx.measureText(txt).width + 20, bh = 24;
            let bx = n.x - bw / 2, by = n.y - n.r - bh - 10;
            bx = Math.max(6, Math.min(W - bw - 6, bx));
            if (by < 6) by = n.y + n.r + 10;
            ctx.fillStyle = 'rgba(15, 21, 32, 0.95)';
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)'; ctx.lineWidth = 1;
            roundRect(ctx, bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(txt, bx + 10, by + bh / 2);
        }

        time += 0.016;
        requestAnimationFrame(drawGraph);
    }

    drawGraph();
}

/* ========================================
   Exploring Canvas (Abstract Illustration)
   ======================================== */
function initExploringCanvas() {
    const canvas = document.getElementById('exploringCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
    }

    resize();

    let time = 0;

    function draw() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // Draw concentric rings
        for (let i = 0; i < 5; i++) {
            const r = 12 + i * 10;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.05 + i * 0.02})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Orbiting dots
        for (let i = 0; i < 8; i++) {
            const orbit = 15 + (i % 5) * 10;
            const speed = 0.3 + i * 0.08;
            const angle = time * speed + (i * Math.PI * 2) / 8;
            const x = cx + Math.cos(angle) * orbit;
            const y = cy + Math.sin(angle) * orbit;

            const colors = ['#22d3ee', '#3b82f6', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#f87171'];
            const color = colors[i % colors.length];
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
            ctx.fill();

            // Glow
            const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
            glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
        }

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();

        time += 0.02;
        requestAnimationFrame(draw);
    }

    draw();
}

/* ========================================
   Scroll-Based Animations
   ======================================== */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Stagger children animations
                const children = entry.target.querySelectorAll('.skill-card, .exploration-item, .model-item, .tech-icon-item, .stat-item, .journal-entry');
                children.forEach((child, i) => {
                    child.style.animationDelay = `${i * 0.05}s`;
                    child.classList.add('in-view');
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.what-i-do, .explorations-section, .models-tech-section, .bottom-sections, .stats-bar, .footer').forEach(section => {
        observer.observe(section);
    });
}

/* ========================================
   Navigation Functionality
   ======================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 60) {
            navbar.style.background = 'rgba(10, 14, 23, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 14, 23, 0.85)';
        }

        lastScroll = currentScroll;
    });

    // Mobile toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
        });
    }

    // Active link tracking
    const sections = document.querySelectorAll('section[id], footer[id]');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ========================================
   Typing Effect for Terminal
   ======================================== */
function initTypingEffect() {
    const terminalText = document.querySelector('.terminal-text');
    if (!terminalText) return;

    // Phrases the terminal cycles through, type/erase loop.
    const phrases = [
        ' building in public, learning in public.',
        ' turning data into decisions.',
        ' shipping systems that compound.',
        ' exploring AI × markets × engineering.',
        ' from messy data to clear signal.',
        ' always learning. always building.'
    ];

    // Respect reduced-motion: show the first phrase statically.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        terminalText.textContent = phrases[0];
        return;
    }

    terminalText.textContent = '';
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = phrases[phraseIndex];

        if (!deleting) {
            charIndex++;
            terminalText.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                return setTimeout(tick, 2200); // hold the full phrase
            }
            setTimeout(tick, 45 + Math.random() * 35);
        } else {
            charIndex--;
            terminalText.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                return setTimeout(tick, 450); // pause before next phrase
            }
            setTimeout(tick, 25 + Math.random() * 20);
        }
    }

    // Start after the hero entrance animation settles.
    setTimeout(tick, 1500);
}

/* ========================================
   Counter Animation for Stats
   ======================================== */
function animateCounters() {
    const statValues = document.querySelectorAll('.stat-value');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;

                // Only animate numeric values
                const match = text.match(/^(\d+)(\+|K\+)?$/);
                if (match) {
                    const target = parseInt(match[1]);
                    const suffix = match[2] || '';
                    let current = 0;
                    const duration = 1500;
                    const startTime = performance.now();

                    function update(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        current = Math.floor(eased * target);

                        el.textContent = current + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            el.textContent = text;
                        }
                    }

                    requestAnimationFrame(update);
                }

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => observer.observe(el));
}

// Initialize counters
document.addEventListener('DOMContentLoaded', animateCounters);

/* ========================================
   Mobile Menu Styles (injected)
   ======================================== */
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .nav-links.mobile-open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 56px;
            left: 0;
            right: 0;
            background: rgba(10, 14, 23, 0.98);
            backdrop-filter: blur(20px);
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
            gap: 16px;
        }

        .nav-links.mobile-open .nav-link {
            font-size: 0.85rem;
            padding: 8px 0;
        }

        .mobile-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(4px, 4px);
        }
        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        .mobile-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(4px, -4px);
        }
    }
`;
document.head.appendChild(mobileStyles);
