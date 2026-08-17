/* ==========================================================================
   Soumik Belel — portfolio
   Vanilla JS. No dependencies.
   ========================================================================== */

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Read a CSS custom property so canvases follow the palette
   instead of drifting from it. */
const _tokenCache = {};
function token(name, fallback) {
    if (_tokenCache[name] === undefined) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        _tokenCache[name] = v || fallback || '#ffffff';
    }
    return _tokenCache[name];
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16)
    ];
}
function rgba(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* Set up a canvas for the device pixel ratio. Uses setTransform rather than
   scale() so repeated resizes don't compound the transform. */
function fitCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: rect.width, h: rect.height };
}

/* Keep a canvas locked to its container. Measuring once at DOMContentLoaded
   is not enough — web fonts and late layout can resize the container
   afterwards, which would leave the canvas at the wrong size. */
function watchSize(canvas, onResize) {
    onResize();
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => onResize()).observe(canvas.parentElement);
    }
    // ResizeObserver callbacks are delivered through the frame pipeline, so
    // keep the plain listeners too — they still fire when frames are throttled.
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
}

/* Lets the journey section talk to the constellation without either
   module knowing about the other's internals. */
const Bus = { focusCluster: null };

/* ==========================================================================
   Hero snapshot canvas — slow orbital rings
   ========================================================================== */
function initSpiralCanvas() {
    const canvas = document.getElementById('spiralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, time = 0;

    const cy = token('--cy', '#22D3EE');
    const hues = [
        token('--hue-1', '#22D3EE'), token('--hue-2', '#A78BFA'),
        token('--hue-3', '#34D399'), token('--hue-4', '#FBBF24'),
        token('--hue-5', '#F472B6')
    ];

    function resize() {
        const d = fitCanvas(canvas, ctx);
        W = d.w; H = d.h;
        // Resizing the backing store clears it, so repaint now rather than
        // waiting on the next animation frame.
        render();
    }

    function render() {
        ctx.clearRect(0, 0, W, H);
        const cx = W / 2, ccy = H / 2;
        const scale = Math.min(W, H) / 130;

        // Concentric rings
        for (let i = 0; i < 5; i++) {
            const r = (14 + i * 11) * scale;
            ctx.beginPath();
            ctx.arc(cx, ccy, r, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(cy, 0.07 + i * 0.015);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // One dot per career stage, each on its own orbit
        for (let i = 0; i < 5; i++) {
            const orbit = (18 + i * 11) * scale;
            const angle = time * (0.34 - i * 0.04) + (i * Math.PI * 2) / 5;
            const x = cx + Math.cos(angle) * orbit;
            const y = ccy + Math.sin(angle) * orbit;
            const color = hues[i];

            const glow = ctx.createRadialGradient(x, y, 0, x, y, 8 * scale);
            glow.addColorStop(0, rgba(color, 0.28));
            glow.addColorStop(1, rgba(color, 0));
            ctx.beginPath();
            ctx.arc(x, y, 8 * scale, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, (i === 0 ? 3 : 2.2) * scale, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, i === 0 ? 0.95 : 0.6);
            ctx.fill();
        }

        // Core
        const core = ctx.createRadialGradient(cx, ccy, 0, cx, ccy, 16 * scale);
        core.addColorStop(0, rgba(cy, 0.35));
        core.addColorStop(1, rgba(cy, 0));
        ctx.beginPath();
        ctx.arc(cx, ccy, 16 * scale, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, ccy, 3.4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = cy;
        ctx.fill();

    }

    function frame() {
        render();
        time += 0.016;
        requestAnimationFrame(frame);
    }

    watchSize(canvas, resize);
    if (!REDUCE_MOTION) frame();
}

/* ==========================================================================
   Skills constellation
   Five cluster hubs mirroring the five career stages, each with its own
   tools orbiting it. Filled node = working with it; hollow dashed node =
   still learning it.
   ========================================================================== */
function initSkillsConstellation() {
    const canvas = document.getElementById('skillsConstellation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const CLUSTERS = [
        { key: 'analytics',   label: 'Analytics',  hue: token('--hue-1', '#22D3EE'), stage: '01' },
        { key: 'science',     label: 'Science',    hue: token('--hue-2', '#A78BFA'), stage: '02' },
        { key: 'engineering', label: 'Data Eng',   hue: token('--hue-3', '#34D399'), stage: '03' },
        { key: 'bigdata',     label: 'Big Data',   hue: token('--hue-4', '#FBBF24'), stage: '04' },
        { key: 'ai',          label: 'AI',         hue: token('--hue-5', '#F472B6'), stage: '05' }
    ];

    const TOOLS = {
        analytics:   [['Python', 1], ['SQL', 1], ['Power BI', 1], ['Tableau', 1]],
        science:     [['scikit-learn', 1], ['statsmodels', 1], ['SciPy', 1], ['Plotly', 1]],
        engineering: [['PostgreSQL', 1], ['Redis', 1], ['FastAPI', 1], ['Docker', 0]],
        bigdata:     [['Spark', 0], ['Kafka', 0], ['AWS', 0], ['Streaming', 0]],
        ai:          [['LLMs', 0], ['RAG', 0], ['PyTorch', 0], ['MLOps', 0]]
    };

    // Build node + edge lists.
    const nodes = [];
    const edges = [];
    const hubIndex = {};

    CLUSTERS.forEach((c, ci) => {
        hubIndex[c.key] = nodes.length;
        nodes.push({
            label: c.label, sub: 'Stage ' + c.stage, cluster: c.key,
            color: c.hue, r: 27, hub: true, owned: true, ci
        });
    });

    CLUSTERS.forEach((c) => {
        const hi = hubIndex[c.key];
        TOOLS[c.key].forEach(([name, owned]) => {
            const idx = nodes.length;
            nodes.push({
                label: name, sub: owned ? 'working with it' : 'learning it',
                cluster: c.key, color: c.hue, r: 15,
                hub: false, owned: !!owned, ci: nodes[hi].ci
            });
            edges.push([hi, idx, !!owned]);
        });
    });

    // Chain the hubs in career order — the path, drawn as a shape.
    for (let i = 0; i < CLUSTERS.length - 1; i++) {
        edges.push([hubIndex[CLUSTERS[i].key], hubIndex[CLUSTERS[i + 1].key], i === 0]);
    }

    const adj = nodes.map(() => new Set());
    edges.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });

    let W = 0, H = 0, time = 0;
    let mouseX = -1, mouseY = -1, hoverIdx = -1, dragIdx = -1;
    let focused = null;   // cluster key highlighted from the journey section

    nodes.forEach(n => { n.x = 0; n.y = 0; n.vx = 0; n.vy = 0; n.hx = 0; n.hy = 0; });

    function layout() {
        const cx = W / 2, cyy = H / 2;
        const base = Math.min(W, H);
        const ring = base * 0.25;
        const orbit = base * 0.145;

        CLUSTERS.forEach((c, i) => {
            const a = (i / CLUSTERS.length) * Math.PI * 2 - Math.PI / 2;
            const hub = nodes[hubIndex[c.key]];
            hub.hx = cx + Math.cos(a) * ring;
            hub.hy = cyy + Math.sin(a) * ring * 0.94;

            const leaves = nodes.filter(n => !n.hub && n.cluster === c.key);
            leaves.forEach((leaf, li) => {
                // Fan the tools outward from the centre, away from the hub.
                const spread = 1.5;
                const la = a + (li - (leaves.length - 1) / 2) * (spread / leaves.length);
                leaf.hx = hub.hx + Math.cos(la) * orbit;
                leaf.hy = hub.hy + Math.sin(la) * orbit * 0.94;
            });
        });

        nodes.forEach(n => {
            if (n.x === 0 && n.y === 0) { n.x = n.hx; n.y = n.hy; }
        });
    }

    function resizeAll() {
        const d = fitCanvas(canvas, ctx);
        W = d.w; H = d.h;
        layout();
        // Resizing the backing store clears it, so repaint now rather than
        // waiting on the next animation frame.
        render();
    }

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
            const n = nodes[dragIdx];
            n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0;
            canvas.style.cursor = 'grabbing';
        } else {
            hoverIdx = nearest(p.x, p.y);
            canvas.style.cursor = hoverIdx >= 0 ? 'grab' : 'default';
        }
    });
    canvas.addEventListener('mouseleave', () => { mouseX = -1; mouseY = -1; hoverIdx = -1; });
    canvas.addEventListener('mousedown', (e) => {
        const p = pointer(e);
        const i = nearest(p.x, p.y);
        if (i >= 0) { dragIdx = i; canvas.style.cursor = 'grabbing'; }
    });
    window.addEventListener('mouseup', () => { dragIdx = -1; });

    canvas.addEventListener('touchmove', (e) => {
        const p = pointer(e); mouseX = p.x; mouseY = p.y;
        if (dragIdx >= 0) {
            const n = nodes[dragIdx];
            n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0;
            e.preventDefault();
        }
    }, { passive: false });
    canvas.addEventListener('touchstart', (e) => {
        const p = pointer(e);
        const i = nearest(p.x, p.y);
        if (i >= 0) { dragIdx = i; hoverIdx = i; }
    }, { passive: true });
    window.addEventListener('touchend', () => { dragIdx = -1; });

    // Journey section drives this. Repaint immediately so the response to a
    // click never waits on the next animation frame.
    Bus.focusCluster = (key) => { focused = key; render(); };

    const resetBtn = document.getElementById('constellationReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            focused = null;
            nodes.forEach(n => { n.x = n.hx; n.y = n.hy; n.vx = 0; n.vy = 0; });
            render();
        });
    }

    function step() {
        for (let i = 0; i < nodes.length; i++) {
            if (i === dragIdx) continue;
            const n = nodes[i];
            const driftX = REDUCE_MOTION ? 0 : Math.sin(time * 0.55 + i * 1.3) * 2;
            const driftY = REDUCE_MOTION ? 0 : Math.cos(time * 0.47 + i * 0.9) * 2;
            n.vx += (n.hx + driftX - n.x) * 0.022;
            n.vy += (n.hy + driftY - n.y) * 0.022;

            if (!REDUCE_MOTION && mouseX >= 0 && dragIdx < 0) {
                const dx = n.x - mouseX, dy = n.y - mouseY;
                const d = Math.hypot(dx, dy);
                if (d < 80 && d > 0.001) {
                    const f = (80 - d) / 80 * 1.4;
                    n.vx += dx / d * f;
                    n.vy += dy / d * f;
                }
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

    const TEXT_HI = token('--text-hi', '#F4F4F5');
    const TEXT_LO = token('--text-lo', '#71717A');
    const PANEL_BG = token('--bg-overlay', '#1A1A1F');

    function render() {
        if (W === 0) return;
        ctx.clearRect(0, 0, W, H);
        step();

        const hovering = hoverIdx >= 0;
        // A node is "lit" if nothing is hovered/focused, or it's part of the
        // hovered neighbourhood, or it belongs to the focused cluster.
        const isLit = (i) => {
            if (hovering) return i === hoverIdx || adj[hoverIdx].has(i);
            if (focused) return nodes[i].cluster === focused;
            return true;
        };

        // Edges
        edges.forEach(([a, b, solid]) => {
            const pa = nodes[a], pb = nodes[b];
            const lit = isLit(a) && isLit(b);
            const alpha = lit ? (solid ? 0.4 : 0.22) : 0.05;

            const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            grad.addColorStop(0, rgba(pa.color, alpha));
            grad.addColorStop(1, rgba(pb.color, alpha));

            ctx.save();
            if (!solid) ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = lit ? 1.4 : 1;
            ctx.stroke();
            ctx.restore();

            // A packet travelling the edge — only on solid (owned) links.
            if (!REDUCE_MOTION && solid && lit) {
                const t = (time * 0.22 + a * 0.3 + b * 0.2) % 1;
                const px = pa.x + (pb.x - pa.x) * t;
                const py = pa.y + (pb.y - pa.y) * t;
                ctx.beginPath();
                ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = rgba(TEXT_HI, 0.55);
                ctx.fill();
            }
        });

        // Nodes
        nodes.forEach((n, i) => {
            const lit = isLit(i);
            const hov = i === hoverIdx;
            const R = n.r * (hov ? 1.14 : 1);
            const alpha = lit ? 1 : 0.28;

            // Halo
            if (n.hub || hov) {
                const g = ctx.createRadialGradient(n.x, n.y, R * 0.4, n.x, n.y, R * 2.1);
                g.addColorStop(0, rgba(n.color, (hov ? 0.3 : 0.15) * alpha));
                g.addColorStop(1, rgba(n.color, 0));
                ctx.beginPath();
                ctx.arc(n.x, n.y, R * 2.1, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
            }

            // Pulse ring on hubs
            if (n.hub && !REDUCE_MOTION) {
                const pr = R + 5 + Math.sin(time * 1.8 + n.ci) * 2.5;
                ctx.beginPath();
                ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, 0.16 * alpha);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Body — owned nodes are filled, learning nodes are hollow + dashed
            ctx.save();
            if (n.owned) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.fillStyle = rgba(n.color, (n.hub ? 0.2 : 0.14) * alpha + 0.02);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.95 : 0.55) * alpha);
                ctx.lineWidth = hov ? 2 : 1.4;
                ctx.stroke();
            } else {
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.85 : 0.45) * alpha);
                ctx.lineWidth = hov ? 1.8 : 1.2;
                ctx.stroke();
            }
            ctx.restore();

            // Label — inside for hubs, below for tools
            ctx.textAlign = 'center';
            if (n.hub) {
                ctx.fillStyle = lit ? n.color : rgba(n.color, 0.4);
                ctx.font = `600 12px 'Inter', sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.fillText(n.label, n.x, n.y);
            } else {
                ctx.fillStyle = lit ? rgba(TEXT_HI, 0.88) : rgba(TEXT_LO, 0.35);
                ctx.font = `500 10px 'Inter', sans-serif`;
                ctx.textBaseline = 'top';
                ctx.fillText(n.label, n.x, n.y + R + 5);
            }
        });

        // Tooltip
        if (hovering && nodes[hoverIdx].sub) {
            const n = nodes[hoverIdx];
            const txt = n.sub;
            ctx.font = `500 11px 'JetBrains Mono', monospace`;
            const bw = ctx.measureText(txt).width + 20;
            const bh = 24;
            let bx = n.x - bw / 2;
            let by = n.y - n.r - bh - 12;
            bx = Math.max(6, Math.min(W - bw - 6, bx));
            if (by < 6) by = n.y + n.r + 22;

            ctx.fillStyle = rgba(PANEL_BG, 0.97);
            ctx.strokeStyle = rgba(n.color, 0.5);
            ctx.lineWidth = 1;
            roundRect(ctx, bx, by, bw, bh, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = TEXT_HI;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(txt, bx + 10, by + bh / 2);
        }
    }

    function frame() {
        render();
        time += 0.016;
        requestAnimationFrame(frame);
    }

    // Sized last: render() closes over the token constants declared above it.
    watchSize(canvas, resizeAll);
    frame();
}

/* ==========================================================================
   Journey — tabbed career path
   ========================================================================== */
function initJourney() {
    const rail = document.getElementById('journeyRail');
    if (!rail) return;

    const tabs = Array.from(rail.querySelectorAll('.stage'));
    const panels = Array.from(document.querySelectorAll('.stage-panel'));
    if (!tabs.length) return;

    let userPicked = false;

    function select(index, { focus = false } = {}) {
        tabs.forEach((tab, i) => {
            const on = i === index;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', String(on));
            tab.tabIndex = on ? 0 : -1;
        });
        panels.forEach((panel, i) => {
            const on = i === index;
            panel.classList.toggle('is-active', on);
            panel.hidden = !on;
        });
        if (focus) tabs[index].focus();
        if (Bus.focusCluster) Bus.focusCluster(tabs[index].dataset.cluster || null);
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            userPicked = true;
            select(i);
        });
        tab.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = tabs.length - 1;
            if (next === null) return;
            e.preventDefault();
            userPicked = true;
            select(next, { focus: true });
        });
    });

    // Gentle auto-advance as the section scrolls past — a click always wins.
    if (!REDUCE_MOTION && 'IntersectionObserver' in window) {
        const section = document.getElementById('journey');
        let auto = 0;
        let timer = null;

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !userPicked && !timer) {
                    timer = setInterval(() => {
                        if (userPicked) { clearInterval(timer); timer = null; return; }
                        auto = (auto + 1) % tabs.length;
                        select(auto);
                    }, 4200);
                } else if (!entry.isIntersecting && timer) {
                    clearInterval(timer);
                    timer = null;
                }
            });
        }, { threshold: 0.45 });

        if (section) io.observe(section);
    }
}

/* ==========================================================================
   Scroll reveal
   ========================================================================== */
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.stats-bar, .section-head, .rail-wrap, .stage-panels, .exp-item, ' +
        '.credentials, .skills-grid, .proj-card, .footer-links, .footer-title'
    );
    targets.forEach(el => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in-view'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 55}ms`;
        io.observe(el);
    });
}

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');

    if (navbar) {
        const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('mobile-open');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('mobile-open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Scrollspy
    const sections = Array.from(document.querySelectorAll('section[id], footer[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    if (sections.length && navLinks.length) {
        const spy = () => {
            const y = window.scrollY + 140;
            let current = '';
            sections.forEach(s => { if (y >= s.offsetTop) current = s.id; });
            navLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + current);
            });
        };
        window.addEventListener('scroll', spy, { passive: true });
        spy();
    }
}

/* ==========================================================================
   Hero terminal typing loop
   ========================================================================== */
function initTypingEffect() {
    const el = document.querySelector('.terminal-text');
    if (!el) return;

    const phrases = [
        ' turning data into decisions.',
        ' three internships, all analytics.',
        ' python, sql, power bi, tableau.',
        ' shipping full-stack with fastapi.',
        ' step one of five. heading to AI.'
    ];

    if (REDUCE_MOTION) {
        el.textContent = phrases[0];
        return;
    }

    el.textContent = '';
    let pi = 0, ci = 0, deleting = false;

    function tick() {
        const current = phrases[pi];
        if (!deleting) {
            ci++;
            el.textContent = current.slice(0, ci);
            if (ci === current.length) {
                deleting = true;
                return setTimeout(tick, 2400);
            }
            setTimeout(tick, 45 + Math.random() * 35);
        } else {
            ci--;
            el.textContent = current.slice(0, ci);
            if (ci === 0) {
                deleting = false;
                pi = (pi + 1) % phrases.length;
                return setTimeout(tick, 420);
            }
            setTimeout(tick, 24 + Math.random() * 18);
        }
    }

    setTimeout(tick, 1400);
}

/* ==========================================================================
   Stat counters
   ========================================================================== */
function animateCounters() {
    const values = document.querySelectorAll('.stat-value');
    if (!values.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const text = el.textContent.trim();
            const match = text.match(/^(\d+)(\+|K\+)?$/);
            io.unobserve(el);
            if (!match) return;

            if (REDUCE_MOTION) return;

            const target = parseInt(match[1], 10);
            const suffix = match[2] || '';
            const duration = 1200;
            const start = performance.now();

            function update(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(eased * target) + suffix;
                if (p < 1) requestAnimationFrame(update);
                else el.textContent = text;
            }
            requestAnimationFrame(update);
        });
    }, { threshold: 0.5 });

    values.forEach(el => io.observe(el));
}

/* ==========================================================================
   Smooth in-page scrolling
   ========================================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: REDUCE_MOTION ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
}

/* ==========================================================================
   Boot
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSmoothScroll();
    initScrollReveal();
    initTypingEffect();
    animateCounters();
    initSpiralCanvas();
    initSkillsConstellation();
    initJourney();
});
