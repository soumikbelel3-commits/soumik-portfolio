/* ==========================================================================
   Soumik Belel — portfolio
   Vanilla JS. No dependencies.
   ========================================================================== */

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Pointer-driven effects (spotlight, tilt, magnetic pull, cursor glow) only
   make sense with a mouse or trackpad — never on touch. */
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Collapse a burst of calls into at most one per animation frame. The
   latest argument wins. */
function rafThrottle(fn) {
    let queued = false, last;
    return (arg) => {
        last = arg;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; fn(last); });
    };
}

/* Tell a callback when an element enters or leaves the viewport. Used to
   park canvas loops and scroll work while their section is offscreen. */
function whenVisible(el, onChange, options) {
    if (!('IntersectionObserver' in window)) { onChange(true); return null; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => onChange(e.isIntersecting, io));
    }, options || { rootMargin: '120px 0px' });
    io.observe(el);
    return io;
}

/* One delegated pointermove listener for every pointer effect, throttled to
   a frame. Subscribers get { x, y, target }; target is null when the
   pointer leaves the window, which is their cue to let go. */
const pointerSubs = [];
function onPointer(fn) {
    if (!pointerSubs.length) {
        const emit = rafThrottle((p) => pointerSubs.forEach(sub => sub(p)));
        document.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            emit({ x: e.clientX, y: e.clientY, target: e.target });
        }, { passive: true });
        document.documentElement.addEventListener('mouseleave', () => {
            emit({ x: -1, y: -1, target: null });
        });
    }
    pointerSubs.push(fn);
}
function closestTo(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
}

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
   Hero snapshot canvas — Neural Data Pipeline Visualizer
   Simulates real-time Kafka event streaming -> Spark distributed processing
   -> Lakehouse feature store -> Deep learning & neural inference.
   ========================================================================== */
let snapshotActiveStack = 'all';

function initSpiralCanvas() {
    const canvas = document.getElementById('spiralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, time = 0;
    let pointerX = -1000, pointerY = -1000;

    const ac = token('--ac', '#F0B429');
    const cStream = token('--hue-4', '#38BDF8');   // Cyan: Streaming / Kafka / Big Data
    const cCompute = token('--ac', '#F0B429');     // Amber: Spark / Compute / Lakehouse
    const cNeural = token('--hue-5', '#F472B6');    // Pink/Rose: PyTorch / Neural Nets
    const cViolet = token('--hue-2', '#A78BFA');    // Violet: Transformer / LLMs

    // Track mouse over canvas
    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        pointerX = e.clientX - r.left;
        pointerY = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => {
        pointerX = -1000;
        pointerY = -1000;
    });

    // 4-Stage Architecture Nodes
    let nodes = [];
    let edges = [];
    let packets = [];
    let sparks = [];

    function setupTopology() {
        if (!W || !H) return;
        nodes = [
            // Tier 0: Ingestion (Kafka Stream)
            { x: W * 0.12, y: H * 0.32, r: 4.5, tier: 0, color: cStream },
            { x: W * 0.12, y: H * 0.68, r: 4.5, tier: 0, color: cStream },

            // Tier 1: Spark Distributed Cluster
            { x: W * 0.38, y: H * 0.22, r: 5, tier: 1, color: cStream },
            { x: W * 0.38, y: H * 0.50, r: 5.5, tier: 1, color: cCompute },
            { x: W * 0.38, y: H * 0.78, r: 5, tier: 1, color: cStream },

            // Tier 2: Lakehouse / Feature Storage
            { x: W * 0.64, y: H * 0.34, r: 5.5, tier: 2, color: cCompute },
            { x: W * 0.64, y: H * 0.66, r: 5.5, tier: 2, color: cViolet },

            // Tier 3: Deep Learning & Neural Inference
            { x: W * 0.85, y: H * 0.26, r: 5, tier: 3, color: cViolet },
            { x: W * 0.85, y: H * 0.50, r: 6.5, tier: 3, color: cNeural },
            { x: W * 0.85, y: H * 0.74, r: 5, tier: 3, color: cViolet },

            // Output Inference Peak
            { x: W * 0.96, y: H * 0.50, r: 3.5, tier: 4, color: ac }
        ];

        // Edges connecting tiers
        edges = [
            // Tier 0 -> Tier 1
            [0, 2], [0, 3], [1, 3], [1, 4],
            // Intra-cluster mesh
            [2, 3], [3, 4],
            // Tier 1 -> Tier 2
            [2, 5], [3, 5], [3, 6], [4, 6],
            // Tier 2 intra
            [5, 6],
            // Tier 2 -> Tier 3
            [5, 7], [5, 8], [6, 8], [6, 9],
            // Tier 3 intra
            [7, 8], [8, 9],
            // Tier 3 -> Output
            [7, 10], [8, 10], [9, 10]
        ];

        // Build continuous pathways for data packets
        const pathways = [
            [0, 2, 5, 7, 10],
            [0, 3, 5, 8, 10],
            [1, 3, 6, 8, 10],
            [1, 4, 6, 9, 10],
            [0, 3, 6, 8, 10],
            [1, 3, 5, 7, 10],
            [0, 2, 3, 5, 8, 10],
            [1, 4, 3, 6, 9, 10]
        ];

        // 20 flowing streaming data packets
        packets = [];
        for (let i = 0; i < 20; i++) {
            packets.push({
                pathway: pathways[i % pathways.length],
                progress: Math.random(),
                speed: 0.005 + Math.random() * 0.006,
                size: 1.8 + Math.random() * 1.3
            });
        }
    }

    function resize() {
        const d = fitCanvas(canvas, ctx);
        W = d.w; H = d.h;
        setupTopology();
        render();
    }

    function render() {
        ctx.clearRect(0, 0, W, H);
        if (!nodes.length) return;

        // Subtle background grid lines
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        const step = 20;
        for (let x = step; x < W; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = step; y < H; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
        ctx.restore();

        // Draw connections / edges
        for (let i = 0; i < edges.length; i++) {
            const [na, nb] = edges[i];
            const a = nodes[na];
            const b = nodes[nb];

            let alpha = 0.09;
            if (snapshotActiveStack === 'bigdata' && (a.tier <= 1 || b.tier <= 1)) alpha = 0.28;
            if (snapshotActiveStack === 'datasci' && ((a.tier >= 1 && a.tier <= 2) || (b.tier >= 1 && b.tier <= 2))) alpha = 0.28;
            if (snapshotActiveStack === 'aiml' && (a.tier >= 2 || b.tier >= 2)) alpha = 0.28;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = rgba(b.color, alpha);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw and update packets (streaming data & neural activations)
        for (let i = 0; i < packets.length; i++) {
            const p = packets[i];
            p.progress += p.speed;
            if (p.progress >= 1) {
                p.progress = 0;
                // Add spark at the output node
                sparks.push({
                    x: nodes[10].x,
                    y: nodes[10].y,
                    r: 2,
                    maxR: 10 + Math.random() * 6,
                    alpha: 0.85,
                    color: Math.random() > 0.5 ? ac : cNeural
                });
            }

            // Interpolate position along the multi-point pathway
            const path = p.pathway;
            const segCount = path.length - 1;
            const scaledProgress = p.progress * segCount;
            const currentSeg = Math.min(Math.floor(scaledProgress), segCount - 1);
            const segT = scaledProgress - currentSeg;

            const nFrom = nodes[path[currentSeg]];
            const nTo = nodes[path[currentSeg + 1]];

            const px = nFrom.x + (nTo.x - nFrom.x) * segT;
            const py = nFrom.y + (nTo.y - nFrom.y) * segT;

            // Packet color shifts from Big Data Cyan -> Amber Lakehouse -> Neural Rose
            let pColor = cStream;
            if (p.progress > 0.35 && p.progress <= 0.7) {
                pColor = cCompute;
            } else if (p.progress > 0.7) {
                pColor = cNeural;
            }

            // Mouse proximity repulsion/acceleration
            const dx = px - pointerX;
            const dy = py - pointerY;
            const dist = Math.hypot(dx, dy);
            let glowSize = p.size * 2.5;
            if (dist < 45) {
                glowSize *= 1.8;
            }

            // Particle glow
            const glow = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
            glow.addColorStop(0, rgba(pColor, 0.7));
            glow.addColorStop(1, rgba(pColor, 0));
            ctx.beginPath();
            ctx.arc(px, py, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Particle core
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = rgba(pColor, 0.95);
            ctx.fill();
        }

        // Draw Sparks (inference activations)
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.r += 0.7;
            s.alpha -= 0.04;
            if (s.alpha <= 0) {
                sparks.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(s.color, s.alpha);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw Nodes
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const dx = n.x - pointerX;
            const dy = n.y - pointerY;
            const isHovered = Math.hypot(dx, dy) < 22;

            // Node pulse
            const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.15;
            const curR = n.r + (isHovered ? 2.5 : pulse);

            let nodeAlpha = 0.85;
            let haloAlpha = 0.25;
            if (snapshotActiveStack === 'bigdata' && n.tier > 1) {
                nodeAlpha = 0.35; haloAlpha = 0.08;
            } else if (snapshotActiveStack === 'datasci' && (n.tier < 1 || n.tier > 2)) {
                nodeAlpha = 0.35; haloAlpha = 0.08;
            } else if (snapshotActiveStack === 'aiml' && n.tier < 2) {
                nodeAlpha = 0.35; haloAlpha = 0.08;
            }

            // Outer halo
            const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, curR * 3);
            halo.addColorStop(0, rgba(n.color, isHovered ? 0.6 : haloAlpha));
            halo.addColorStop(1, rgba(n.color, 0));
            ctx.beginPath();
            ctx.arc(n.x, n.y, curR * 3, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();

            // Node ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, curR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(n.color, nodeAlpha);
            ctx.fill();

            // Inner bright core
            ctx.beginPath();
            ctx.arc(n.x, n.y, curR * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }
    }

    watchSize(canvas, resize);
    if (!REDUCE_MOTION) {
        runWhileVisible(canvas, () => {
            render();
            time += 0.02;
        });
    } else {
        setupTopology();
        render();
    }
}

/* ==========================================================================
   Hero snapshot tech tabs filter
   ========================================================================== */
function initSnapshotTabs() {
    const tabs = document.querySelectorAll('.snapshot-stack-nav .stack-tab');
    const groups = document.querySelectorAll('.snapshot-stack-body .snap-group');
    if (!tabs.length || !groups.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const stack = tab.getAttribute('data-stack');
            snapshotActiveStack = stack;

            tabs.forEach(t => {
                const isActive = t === tab;
                t.classList.toggle('is-active', isActive);
                t.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            groups.forEach(group => {
                const cat = group.getAttribute('data-category');
                if (stack === 'all') {
                    group.classList.remove('is-hidden');
                } else if (cat === stack) {
                    group.classList.remove('is-hidden');
                } else {
                    group.classList.add('is-hidden');
                }
            });
        });
    });
}

/* Drive a per-frame callback only while its canvas is on screen and the tab
   is visible. Nothing is scheduled at all otherwise. */
function runWhileVisible(canvas, tick) {
    let onScreen = false, raf = 0;
    function frame() {
        raf = 0;
        if (!onScreen || document.hidden) return;
        tick();
        raf = requestAnimationFrame(frame);
    }
    function kick() {
        if (onScreen && !document.hidden && !raf) raf = requestAnimationFrame(frame);
    }
    whenVisible(canvas, (vis) => { onScreen = vis; kick(); });
    document.addEventListener('visibilitychange', kick);
}

/* ==========================================================================
   Skills constellation ($1B Tier Neural Topology)
   Five cluster hubs mirroring the five career stages, each with its production
   tools and frontier research orbiting it. Full bidirectional telemetry,
   spring physics, HUD inspection, and real-time omni-search filtering.
   ========================================================================== */
function initSkillsConstellation() {
    const canvas = document.getElementById('skillsConstellation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const CLUSTERS = [
        { key: 'analytics',   label: 'Analytics',  hue: token('--hue-1', '#F0B429'), stage: '01', role: 'Data Analyst', desc: 'Core analytical pipelines, statistical reporting, SQL modeling & executive BI' },
        { key: 'science',     label: 'Science',    hue: token('--hue-2', '#A78BFA'), stage: '02', role: 'Data Scientist', desc: 'Supervised/unsupervised statistical machine learning, churn prediction & predictive inference' },
        { key: 'engineering', label: 'Data Eng',   hue: token('--hue-3', '#34D399'), stage: '03', role: 'Data Engineer', desc: 'Relational data modeling, asynchronous REST microservices & low-latency caching' },
        { key: 'bigdata',     label: 'Big Data',   hue: token('--hue-4', '#38BDF8'), stage: '04', role: 'Big Data Specialist', desc: 'Distributed computing, real-time event streaming, modern analytics engineering & cloud data lakes' },
        { key: 'ai',          label: 'AI & ML',    hue: token('--hue-5', '#F472B6'), stage: '05', role: 'AI/ML Engineer', desc: 'Deep neural networks, foundation transformer models, tensor math & agentic RAG' }
    ];

    const TOOLS = {
        analytics: [
            ['Python', 1, 'Core analytical workflows, data manipulation, automation & scripts'],
            ['SQL', 1, 'Complex analytical queries, window functions, CTEs & data modeling'],
            ['Power BI', 1, 'Executive KPI dashboards, DAX measures & star modeling'],
            ['Tableau', 1, 'Interactive business intelligence & visual storytelling'],
            ['Regression', 1, 'Linear & logistic statistical modeling for continuous trends'],
            ['Excel / PQ', 1, 'Power Query ETL, financial modeling & pivot tables']
        ],
        science: [
            ['scikit-learn', 1, 'Machine learning modeling, classification, regression & clustering'],
            ['Clustering', 1, 'K-Means, DBSCAN & customer behavioral cohort segmentation'],
            ['Classification', 1, 'Binary & multi-class decision boundaries & risk scoring'],
            ['XGBoost', 0, 'Gradient boosted trees & hyperparameter optimization'],
            ['Forecasting', 0, 'ARIMA, SARIMAX, Prophet & time-series decomposition'],
            ['Pandas', 1, 'High-throughput tabular dataframe wrangling & matrix operations']
        ],
        engineering: [
            ['PostgreSQL', 1, 'Relational modeling, indexing, CTEs & JSONB data storage'],
            ['FastAPI', 1, 'Asynchronous REST APIs, Pydantic data schemas & microservices'],
            ['Redis', 1, 'High-speed in-memory caching & session state storage'],
            ['Docker', 0, 'Containerization & reproducible multi-stage deployment images'],
            ['Feature store', 0, 'Low-latency ML feature catalog & offline/online sync'],
            ['Airflow', 0, 'DAG workflow scheduling & pipeline orchestration']
        ],
        bigdata: [
            ['Spark', 0, 'Distributed memory transformations & large-scale data analytics'],
            ['Kafka', 0, 'Real-time event streaming, consumer groups & message queues'],
            ['Streaming', 0, 'Real-time structured streaming & sliding event windows'],
            ['AWS', 0, 'Cloud computing, S3 object storage & serverless ETL pipelines'],
            ['MLlib', 0, 'Scalable machine learning algorithms on distributed memory'],
            ['dbt', 0, 'Analytics engineering, modular SQL models & automated testing']
        ],
        ai: [
            ['PyTorch', 0, 'Dynamic tensor computation, autograd & neural network design'],
            ['Deep learning', 0, 'Multi-layer perceptrons, backpropagation & loss curves'],
            ['Transformers', 0, 'Hugging Face attention architectures & fine-tuning'],
            ['LLMs', 0, 'Large language model agents, prompts & reasoning pipelines'],
            ['RAG', 0, 'Retrieval-augmented generation with vector databases'],
            ['MLOps', 0, 'Model registry, continuous monitoring & performance drift alerts']
        ]
    };

    const COMPACT_AT = 620;
    const SHOWN_COMPACT = 4;

    // Build node + edge lists
    const nodes = [];
    const edges = [];
    const hubIndex = {};

    CLUSTERS.forEach((c, ci) => {
        hubIndex[c.key] = nodes.length;
        nodes.push({
            label: c.label,
            role: c.role,
            desc: c.desc,
            sub: 'Stage ' + c.stage + ' · ' + c.role,
            cluster: c.key,
            stage: c.stage,
            color: c.hue,
            r: 28,
            hub: true,
            owned: true,
            ci
        });
    });

    CLUSTERS.forEach((c) => {
        const hi = hubIndex[c.key];
        TOOLS[c.key].forEach(([name, owned, roleDesc], li) => {
            const idx = nodes.length;
            nodes.push({
                label: name,
                role: c.role,
                desc: roleDesc || (owned ? 'Production competency' : 'Active research & development'),
                sub: owned ? 'Production · ' + name : 'Pipeline · ' + name,
                cluster: c.key,
                stage: c.stage,
                color: c.hue,
                r: 13,
                hub: false,
                owned: !!owned,
                ci: nodes[hi].ci,
                slim: li >= SHOWN_COMPACT
            });
            edges.push([hi, idx, !!owned, false]);
        });
    });

    // Chain the hubs in career order — the golden path pipeline spine
    for (let i = 0; i < CLUSTERS.length - 1; i++) {
        edges.push([hubIndex[CLUSTERS[i].key], hubIndex[CLUSTERS[i + 1].key], true, true]);
    }

    const adj = nodes.map(() => new Set());
    edges.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });

    // Background drifting celestial stars
    const stars = [];
    for (let s = 0; s < 36; s++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            r: 0.6 + Math.random() * 1.2,
            speed: 0.3 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.15 + Math.random() * 0.35
        });
    }

    let W = 0, H = 0, time = 0;
    let mouseX = -1, mouseY = -1, hoverIdx = -1, dragIdx = -1;
    let externalHoverIdx = -1; // Triggered by hovering cards/chips below
    let focused = null;        // cluster key highlighted
    let searchQuery = '';      // Active search query
    let activeQuickFilter = 'all'; // 'all' | 'owned' | 'learning' | 'ml' | 'engineering'
    let compact = false;
    let scale = 1;
    let intro = REDUCE_MOTION ? 1 : 0;
    let introStart = 0;

    nodes.forEach(n => { n.x = 0; n.y = 0; n.vx = 0; n.vy = 0; n.hx = 0; n.hy = 0; n.pulse = 0; });

    // HUD Elements
    const hudCard = document.getElementById('constellationHud');
    const hudStage = document.getElementById('hudStage');
    const hudStatus = document.getElementById('hudStatus');
    const hudTitle = document.getElementById('hudTitle');
    const hudDesc = document.getElementById('hudDesc');
    const hudMeta = document.getElementById('hudMeta');
    const nodeCountEl = document.getElementById('constellationNodeCount');

    function updateHud(n) {
        if (!hudCard) return;
        if (n) {
            if (hudStage) hudStage.textContent = n.hub ? `STAGE ${n.stage} · HUB` : `STAGE ${n.stage} · ${n.cluster.toUpperCase()}`;
            if (hudStatus) {
                hudStatus.textContent = n.owned ? 'PRODUCTION' : 'IN PIPELINE';
                hudStatus.style.color = n.owned ? '#34D399' : '#F0B429';
                hudStatus.style.borderColor = n.owned ? 'rgba(52, 211, 153, 0.3)' : 'rgba(240, 180, 41, 0.3)';
                hudStatus.style.background = n.owned ? 'rgba(52, 211, 153, 0.12)' : 'rgba(240, 180, 41, 0.12)';
            }
            if (hudTitle) hudTitle.textContent = n.label;
            if (hudDesc) hudDesc.textContent = n.desc || n.sub;
            if (hudMeta) {
                const conns = adj[nodes.indexOf(n)] ? adj[nodes.indexOf(n)].size : 0;
                hudMeta.textContent = `${n.role} · ${conns} Signal Connections · Drag to move`;
            }
            hudCard.style.borderColor = rgba(n.color, 0.4);
            hudCard.style.boxShadow = `0 16px 36px -8px rgba(0, 0, 0, 0.7), 0 0 20px -4px ${rgba(n.color, 0.25)}`;
        } else {
            if (hudStage) hudStage.textContent = focused ? `STAGE · ${focused.toUpperCase()}` : 'TOPOLOGY OVERVIEW';
            if (hudStatus) {
                hudStatus.textContent = 'ONLINE';
                hudStatus.style.color = '#34D399';
                hudStatus.style.borderColor = 'rgba(52, 211, 153, 0.3)';
                hudStatus.style.background = 'rgba(52, 211, 153, 0.12)';
            }
            if (hudTitle) hudTitle.textContent = focused ? CLUSTERS.find(c => c.key === focused)?.label + ' Network' : 'Interactive Topology';
            if (hudDesc) {
                hudDesc.textContent = focused
                    ? CLUSTERS.find(c => c.key === focused)?.desc
                    : 'Hover any node or cluster to inspect technical capabilities, signal routes, and production telemetry.';
            }
            if (hudMeta) hudMeta.textContent = 'Drag nodes · Hover clusters · Click tabs to isolate';
            hudCard.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            hudCard.style.boxShadow = '0 16px 36px -8px rgba(0, 0, 0, 0.7)';
        }
    }

    function layout() {
        const cx = W / 2, cyy = H / 2;
        const base = Math.min(W, H);

        compact = W < COMPACT_AT;
        scale = compact ? Math.max(0.75, Math.min(1, base / 440)) : 1;
        nodes.forEach(n => {
            n.off = compact && n.slim;
            n.r = (n.hub ? 28 : 13) * scale;
        });

        if (hoverIdx >= 0 && nodes[hoverIdx].off) hoverIdx = -1;
        if (dragIdx >= 0 && nodes[dragIdx].off) dragIdx = -1;

        const sx = Math.max(1, Math.min((W / H) * 0.85, 2.0));
        const ringX = base * (compact ? 0.25 : 0.30) * sx;
        const ringY = H * (compact ? 0.16 : 0.18);
        const rLeaf = 13 * scale;
        const labelRoom = rLeaf + 16 * scale;
        const orbit = Math.max((28 + 14) * scale + 6, Math.min(
            H * 0.25,
            H / 2 - ringY - labelRoom,
            (W / 2 - ringX - rLeaf - 8) / sx
        ));

        CLUSTERS.forEach((c, i) => {
            const a = (i / CLUSTERS.length) * Math.PI * 2 - Math.PI / 2;
            const hub = nodes[hubIndex[c.key]];
            hub.hx = cx + Math.cos(a) * ringX;
            hub.hy = cyy + Math.sin(a) * ringY;

            const leaves = nodes.filter(n => !n.hub && !n.off && n.cluster === c.key);
            const spread = leaves.length > 5 ? 1.85 : 1.3;
            leaves.forEach((leaf, li) => {
                leaf.labelUp = li % 2 === 1;
                const la = a + (li - (leaves.length - 1) / 2) * (spread / leaves.length);
                leaf.hx = hub.hx + Math.cos(la) * orbit * sx;
                leaf.hy = hub.hy + Math.sin(la) * orbit;
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
            if (n.off) return;
            const d = Math.hypot(px - n.x, py - n.y);
            if (d < n.r + 14 && d < best) { best = d; idx = i; }
        });
        return idx;
    }

    // Bidirectional sync: Highlight chip in stack lists below
    function syncHighlightChip(node) {
        const label = node ? node.label.toLowerCase() : null;
        document.querySelectorAll('.chip-tool').forEach(chip => {
            const skill = (chip.dataset.skill || chip.textContent).trim().toLowerCase();
            if (label && (skill.includes(label) || label.includes(skill))) {
                chip.classList.add('is-highlighted');
            } else {
                chip.classList.remove('is-highlighted');
            }
        });
    }

    canvas.addEventListener('mousemove', (e) => {
        const p = pointer(e); mouseX = p.x; mouseY = p.y;
        if (dragIdx >= 0) {
            const n = nodes[dragIdx];
            n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0;
            canvas.style.cursor = 'grabbing';
        } else {
            const prev = hoverIdx;
            hoverIdx = nearest(p.x, p.y);
            canvas.style.cursor = hoverIdx >= 0 ? 'grab' : 'default';
            if (hoverIdx !== prev) {
                if (hoverIdx >= 0) {
                    updateHud(nodes[hoverIdx]);
                    syncHighlightChip(nodes[hoverIdx]);
                } else if (externalHoverIdx < 0) {
                    updateHud(null);
                    syncHighlightChip(null);
                }
            }
        }
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1; mouseY = -1; hoverIdx = -1;
        if (externalHoverIdx < 0) {
            updateHud(null);
            syncHighlightChip(null);
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        const p = pointer(e);
        const i = nearest(p.x, p.y);
        if (i >= 0) {
            dragIdx = i;
            canvas.style.cursor = 'grabbing';
            // Click to isolate cluster or highlight
            if (nodes[i].hub) {
                setClusterFocus(nodes[i].cluster);
            }
        }
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
        if (i >= 0) {
            dragIdx = i; hoverIdx = i;
            updateHud(nodes[i]);
            syncHighlightChip(nodes[i]);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => { dragIdx = -1; });

    function setClusterFocus(clusterKey) {
        focused = (focused === clusterKey) ? null : clusterKey;

        // Sync cluster filter buttons
        document.querySelectorAll('.c-filter-btn').forEach(btn => {
            const c = btn.dataset.cluster;
            const active = (focused === null && c === 'all') || (focused === c);
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        // Sync stack groups below: subtle spotlight
        document.querySelectorAll('.stack-group').forEach(grp => {
            if (!focused) {
                grp.style.opacity = '1';
                grp.style.borderColor = '';
            } else {
                const match = grp.querySelector(`.chip-tool[data-cluster="${focused}"]`);
                grp.style.opacity = match ? '1' : '0.4';
                grp.style.borderColor = match ? 'var(--line-strong)' : '';
            }
        });

        updateHud(hoverIdx >= 0 ? nodes[hoverIdx] : null);
        render();
    }

    // Connect cluster filter buttons
    document.querySelectorAll('.c-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const c = btn.dataset.cluster;
            setClusterFocus(c === 'all' ? null : c);
        });
    });

    // Reset button
    const resetBtn = document.getElementById('constellationReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            focused = null;
            searchQuery = '';
            activeQuickFilter = 'all';
            const searchInput = document.getElementById('skillsSearchInput');
            if (searchInput) searchInput.value = '';
            const searchClear = document.getElementById('skillsSearchClear');
            if (searchClear) searchClear.hidden = true;

            // Reset filter tabs & quick filter buttons
            document.querySelectorAll('.c-filter-btn').forEach(b => {
                const active = b.dataset.cluster === 'all';
                b.classList.toggle('is-active', active);
            });
            document.querySelectorAll('.q-filter-btn').forEach(b => {
                b.classList.toggle('is-active', b.dataset.filter === 'all');
            });

            // Reset chips
            document.querySelectorAll('.chip-tool').forEach(ch => {
                ch.classList.remove('is-dimmed', 'is-highlighted');
            });
            document.querySelectorAll('.stack-group').forEach(g => {
                g.style.opacity = '1';
                g.style.borderColor = '';
            });

            // Spring reset positions
            nodes.forEach(n => {
                n.x = n.hx; n.y = n.hy; n.vx = 0; n.vy = 0;
            });
            updateHud(null);
            updateFilterStats();
            render();
        });
    }

    // Omni-Search & Quick Filter Integration
    const searchInput = document.getElementById('skillsSearchInput');
    const searchClear = document.getElementById('skillsSearchClear');

    function applyFilters() {
        const q = searchQuery.toLowerCase().trim();
        let matchCount = 0;

        document.querySelectorAll('.chip-tool').forEach(chip => {
            const name = (chip.dataset.skill || chip.textContent).toLowerCase();
            const role = (chip.dataset.role || '').toLowerCase();
            const cluster = (chip.dataset.cluster || '').toLowerCase();
            const isOwned = chip.classList.contains('is-owned');

            let matchesSearch = !q || name.includes(q) || role.includes(q) || cluster.includes(q);
            let matchesQuick = true;

            if (activeQuickFilter === 'owned') matchesQuick = isOwned;
            else if (activeQuickFilter === 'learning') matchesQuick = !isOwned;
            else if (activeQuickFilter === 'ml') matchesQuick = cluster === 'science' || cluster === 'ai';
            else if (activeQuickFilter === 'engineering') matchesQuick = cluster === 'engineering' || cluster === 'bigdata';

            const active = matchesSearch && matchesQuick;
            chip.classList.toggle('is-dimmed', !active);
            if (active && (q.length > 0 || activeQuickFilter !== 'all')) {
                matchCount++;
            }
        });

        // Dim or highlight stack groups based on matching chips
        document.querySelectorAll('.stack-group').forEach(grp => {
            const visibleChips = grp.querySelectorAll('.chip-tool:not(.is-dimmed)');
            grp.style.opacity = visibleChips.length > 0 ? '1' : '0.28';
        });

        updateFilterStats(q.length > 0 || activeQuickFilter !== 'all' ? matchCount : null);
        render();
    }

    function updateFilterStats(count) {
        if (!nodeCountEl) return;
        if (count !== null && count !== undefined) {
            nodeCountEl.textContent = `${count} MATCHING CAPABILITIES`;
            nodeCountEl.style.color = 'var(--ac)';
        } else {
            const activeNodes = nodes.filter(n => !n.off && (!focused || n.cluster === focused)).length;
            nodeCountEl.textContent = `${activeNodes} NODES ACTIVE`;
            nodeCountEl.style.color = 'var(--text-lo)';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (searchClear) searchClear.hidden = searchQuery.length === 0;
            applyFilters();
        });
    }
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            searchClear.hidden = true;
            applyFilters();
        });
    }

    // Quick filter buttons
    document.querySelectorAll('.q-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.q-filter-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            activeQuickFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // Bidirectional linking: Hovering chip in stack lists activates canvas node!
    document.querySelectorAll('.chip-tool').forEach(chip => {
        const skillName = (chip.dataset.skill || chip.textContent).trim().toLowerCase();
        chip.addEventListener('mouseenter', () => {
            const targetNodeIdx = nodes.findIndex(n => {
                const label = n.label.toLowerCase();
                return label.includes(skillName) || skillName.includes(label);
            });
            if (targetNodeIdx >= 0) {
                externalHoverIdx = targetNodeIdx;
                nodes[targetNodeIdx].pulse = 1.0;
                updateHud(nodes[targetNodeIdx]);
            }
        });
        chip.addEventListener('mouseleave', () => {
            externalHoverIdx = -1;
            if (hoverIdx < 0) updateHud(null);
        });
    });

    // Bus integration with Journey section
    Bus.focusCluster = (key) => {
        setClusterFocus(key);
    };

    function step() {
        for (let i = 0; i < nodes.length; i++) {
            if (i === dragIdx) continue;
            const n = nodes[i];
            if (n.off) continue;
            const driftX = REDUCE_MOTION ? 0 : Math.sin(time * 0.55 + i * 1.3) * 2;
            const driftY = REDUCE_MOTION ? 0 : Math.cos(time * 0.47 + i * 0.9) * 2;
            n.vx += (n.hx + driftX - n.x) * 0.024;
            n.vy += (n.hy + driftY - n.y) * 0.024;

            if (!REDUCE_MOTION && mouseX >= 0 && dragIdx < 0) {
                const dx = n.x - mouseX, dy = n.y - mouseY;
                const d = Math.hypot(dx, dy);
                if (d < 85 && d > 0.001) {
                    const f = (85 - d) / 85 * 1.6;
                    n.vx += dx / d * f;
                    n.vy += dy / d * f;
                }
            }
            n.vx *= 0.85; n.vy *= 0.85;
            n.x += n.vx; n.y += n.vy;

            // Decay attention pulse
            if (n.pulse > 0) n.pulse = Math.max(0, n.pulse - 0.025);
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
    const TEXT_MID = token('--text-mid', '#A1A1AA');
    const TEXT_LO = token('--text-lo', '#8B8B95');
    const ACCENT = token('--ac', '#F0B429');

    function bloom() {
        const cx = W / 2, cyy = H / 2;
        nodes.forEach(n => {
            if (n.hub) { n.x = cx; n.y = cyy; }
            else {
                const hub = nodes[hubIndex[n.cluster]];
                n.x = hub.hx; n.y = hub.hy;
            }
            n.vx = 0; n.vy = 0;
        });
        introStart = performance.now();
    }

    function render() {
        if (W === 0) return;
        ctx.clearRect(0, 0, W, H);
        step();

        if (intro < 1 && introStart) {
            intro = Math.min(1, (performance.now() - introStart) / 900);
        }
        ctx.globalAlpha = 1 - Math.pow(1 - intro, 3);

        const activeHoverIdx = hoverIdx >= 0 ? hoverIdx : externalHoverIdx;
        const hovering = activeHoverIdx >= 0;

        // Filter search matches
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = (n) => {
            if (!q) return true;
            return n.label.toLowerCase().includes(q) || (n.desc && n.desc.toLowerCase().includes(q));
        };

        const isLit = (i) => {
            const n = nodes[i];
            if (!matchesSearch(n)) return false;
            if (activeQuickFilter === 'owned' && !n.owned) return false;
            if (activeQuickFilter === 'learning' && n.owned) return false;
            if (activeQuickFilter === 'ml' && n.cluster !== 'science' && n.cluster !== 'ai') return false;
            if (activeQuickFilter === 'engineering' && n.cluster !== 'engineering' && n.cluster !== 'bigdata') return false;

            if (hovering) return i === activeHoverIdx || adj[activeHoverIdx].has(i);
            if (focused) return n.cluster === focused;
            return true;
        };

        // 1. Technical Background Matrix Grid & Crosshairs
        const gridStep = 55;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += gridStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += gridStep) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Crosshairs at grid intersections
        ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
        for (let x = gridStep; x < W; x += gridStep * 2) {
            for (let y = gridStep; y < H; y += gridStep * 2) {
                ctx.fillRect(x - 3, y, 7, 1);
                ctx.fillRect(x, y - 3, 1, 7);
            }
        }

        // Concentric range rings from canvas center
        const cx = W / 2, cy = H / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.setLineDash([2, 8]);
        [Math.min(W, H) * 0.22, Math.min(W, H) * 0.38, Math.min(W, H) * 0.54].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Drifting celestial stars
        stars.forEach(st => {
            const sx = (st.x * W + time * st.speed * 4) % W;
            const sy = (st.y * H + Math.sin(time * 0.4 + st.phase) * 6) % H;
            const a = st.alpha * (0.6 + 0.4 * Math.sin(time * 1.5 + st.phase));
            ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
            ctx.beginPath();
            ctx.arc(sx, sy, st.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // 2. Edges / Data Pipelines
        edges.forEach(([a, b, solid, isSpine]) => {
            const pa = nodes[a], pb = nodes[b];
            if (pa.off || pb.off) return;
            const lit = isLit(a) && isLit(b);
            const edgeAlpha = lit ? (isSpine ? 0.75 : (solid ? 0.48 : 0.24)) : 0.04;

            const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            if (isSpine) {
                grad.addColorStop(0, rgba(ACCENT, edgeAlpha));
                grad.addColorStop(0.5, rgba(pa.color, edgeAlpha * 1.2));
                grad.addColorStop(1, rgba(pb.color, edgeAlpha));
            } else {
                grad.addColorStop(0, rgba(pa.color, edgeAlpha));
                grad.addColorStop(1, rgba(pb.color, edgeAlpha * 0.75));
            }

            ctx.save();
            if (!solid && !isSpine) ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = isSpine ? (lit ? 2.6 : 1.5) : (lit ? 1.6 : 1.0);
            ctx.stroke();
            ctx.restore();

            // Flowing Signal Data Packets
            if (!REDUCE_MOTION && lit && (solid || isSpine)) {
                const count = isSpine ? 3 : 1;
                for (let p = 0; p < count; p++) {
                    const t = (time * (isSpine ? 0.35 : 0.22) + a * 0.2 + b * 0.15 + (p / count)) % 1;
                    const px = pa.x + (pb.x - pa.x) * t;
                    const py = pa.y + (pb.y - pa.y) * t;

                    // Comet tail
                    const tailLen = isSpine ? 14 : 9;
                    const tx = px - (pb.x - pa.x) * 0.04 * (tailLen / 10);
                    const ty = py - (pb.y - pa.y) * 0.04 * (tailLen / 10);
                    const tGrad = ctx.createLinearGradient(tx, ty, px, py);
                    tGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                    tGrad.addColorStop(1, isSpine ? rgba(ACCENT, 0.9) : rgba(TEXT_HI, 0.85));

                    ctx.beginPath();
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = tGrad;
                    ctx.lineWidth = isSpine ? 2.5 : 1.6;
                    ctx.stroke();

                    // Packet head
                    ctx.beginPath();
                    ctx.arc(px, py, isSpine ? 2.4 : 1.8, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fill();
                }
            }
        });

        // 3. Nodes Rendering
        nodes.forEach((n, i) => {
            if (n.off) return;
            const lit = isLit(i);
            const hov = i === activeHoverIdx;
            const R = n.r * (hov ? 1.18 : 1);
            const alpha = lit ? 1 : 0.16;

            // Attention radar ripple
            if (n.pulse > 0 || (hov && !REDUCE_MOTION)) {
                const rippleR = R + 8 + (1 - n.pulse) * 24;
                ctx.beginPath();
                ctx.arc(n.x, n.y, rippleR, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (n.pulse || 0.4) * 0.6);
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Atmosphere Radial Glow Halo
            if (n.hub || hov) {
                const haloR = R * (n.hub ? 2.5 : 2.0);
                const g = ctx.createRadialGradient(n.x, n.y, R * 0.3, n.x, n.y, haloR);
                g.addColorStop(0, rgba(n.color, (hov ? 0.38 : 0.18) * alpha));
                g.addColorStop(1, rgba(n.color, 0));
                ctx.beginPath();
                ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
            }

            // Dual high-tech rotating orbital rings on hubs
            if (n.hub && !REDUCE_MOTION) {
                ctx.save();
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.arc(n.x, n.y, R + 7, time * 0.6 + n.ci, time * 0.6 + n.ci + Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.45 : 0.22) * alpha);
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.setLineDash([2, 8]);
                ctx.beginPath();
                ctx.arc(n.x, n.y, R + 13, -time * 0.4 + n.ci, -time * 0.4 + n.ci + Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.3 : 0.12) * alpha);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }

            // Node Body
            ctx.save();
            if (n.hub) {
                // Glass reactor core
                const coreGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, R);
                coreGrad.addColorStop(0, rgba(n.color, 0.4 * alpha));
                coreGrad.addColorStop(0.7, rgba(n.color, 0.12 * alpha));
                coreGrad.addColorStop(1, rgba(n.color, 0.05 * alpha));

                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.fillStyle = coreGrad;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 1 : 0.75) * alpha);
                ctx.lineWidth = hov ? 2.4 : 1.8;
                ctx.stroke();

                // Inner stage number
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `600 ${(9.5 * scale).toFixed(1)}px 'JetBrains Mono', monospace`;
                ctx.fillStyle = lit ? rgba(n.color, 0.9) : rgba(n.color, 0.4);
                ctx.fillText(`0${n.stage}`, n.x, n.y - 7 * scale);

                // Cluster title
                ctx.font = `700 ${(11.5 * scale).toFixed(1)}px 'Inter', sans-serif`;
                ctx.fillStyle = lit ? '#FFFFFF' : rgba(TEXT_HI, 0.4);
                ctx.fillText(n.label, n.x, n.y + 6 * scale);
            } else if (n.owned) {
                // Solid Production Node
                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.fillStyle = rgba(n.color, 0.22 * alpha);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.98 : 0.65) * alpha);
                ctx.lineWidth = hov ? 2.2 : 1.4;
                ctx.stroke();

                // Bright glowing pip in center
                ctx.beginPath();
                ctx.arc(n.x, n.y, 3.5 * scale, 0, Math.PI * 2);
                ctx.fillStyle = rgba(n.color, (hov ? 1 : 0.9) * alpha);
                ctx.fill();
            } else {
                // Dashed Pipeline / Learning Node
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(n.color, (hov ? 0.9 : 0.45) * alpha);
                ctx.lineWidth = hov ? 2 : 1.2;
                ctx.stroke();

                // Hollow center ember
                ctx.beginPath();
                ctx.arc(n.x, n.y, 2 * scale, 0, Math.PI * 2);
                ctx.fillStyle = rgba(n.color, 0.7 * alpha);
                ctx.fill();
            }
            ctx.restore();

            // Frosted Glass Label Pill for Satellite Tools
            if (!n.hub) {
                ctx.font = `500 ${(10.5 * scale).toFixed(1)}px 'Inter', sans-serif`;
                const textWidth = ctx.measureText(n.label).width;
                const pillW = textWidth + 14 * scale;
                const pillH = 18 * scale;
                const pillX = n.x - pillW / 2;
                const pillY = n.labelUp ? n.y - R - pillH - 4 * scale : n.y + R + 4 * scale;

                // Clamp to canvas borders
                const clampedX = Math.max(4, Math.min(W - pillW - 4, pillX));

                ctx.save();
                roundRect(ctx, clampedX, pillY, pillW, pillH, 4 * scale);
                ctx.fillStyle = rgba('#0C0C11', lit ? (hov ? 0.95 : 0.85) : 0.4);
                ctx.fill();
                ctx.strokeStyle = rgba(n.color, lit ? (hov ? 0.8 : 0.3) : 0.08);
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = lit ? (hov ? '#FFFFFF' : rgba(TEXT_HI, 0.92)) : rgba(TEXT_LO, 0.3);
                ctx.fillText(n.label, clampedX + pillW / 2, pillY + pillH / 2);
                ctx.restore();
            }
        });

        ctx.globalAlpha = 1;
    }

    watchSize(canvas, resizeAll);
    runWhileVisible(canvas, () => { render(); time += 0.016; });

    if (!REDUCE_MOTION) {
        whenVisible(canvas, (vis, io) => {
            if (!vis || introStart) return;
            if (io) io.disconnect();
            bloom();
        }, { threshold: 0.3 });
    }

    // Initialize HUD and stats
    updateHud(null);
    updateFilterStats();

    // Sized last: render() closes over the token constants declared above it.
    watchSize(canvas, resizeAll);
    runWhileVisible(canvas, () => { render(); time += 0.016; });

    if (!REDUCE_MOTION) {
        whenVisible(canvas, (vis, io) => {
            if (!vis || introStart) return;
            if (io) io.disconnect();
            bloom();
        }, { threshold: 0.3 });
    }
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

    const indicator = rail.querySelector('.rail-indicator');
    let current = Math.max(0, tabs.findIndex(t => t.classList.contains('is-active')));

    // The selection pill is sized to the selected tab and moved by
    // `translate`. offset* ignore transforms, so the rail's own reveal
    // animation can't skew the measurement.
    function placeIndicator(instant) {
        if (!indicator) return;
        const t = tabs[current];
        if (instant) indicator.style.transition = 'none';
        indicator.style.width = t.offsetWidth + 'px';
        indicator.style.height = t.offsetHeight + 'px';
        indicator.style.translate = `${t.offsetLeft}px ${t.offsetTop}px`;
        if (instant) {
            void indicator.offsetWidth;   // commit the jump before re-enabling transitions
            indicator.style.transition = '';
        }
    }

    // Each panel's contents cascade in on switch. Main column and side column
    // count separately so both finish at about the same time.
    panels.forEach(panel => {
        [['.panel-main', '.panel-head, .panel-thesis, .panel-body, .evidence-label, .evidence-list li'],
         ['.panel-side', '.panel-side-label, .side-ml-note, .chip-tool']].forEach(([col, sel], c) => {
            const root = panel.querySelector(col);
            if (!root) return;
            root.querySelectorAll(sel).forEach((el, i) => {
                el.classList.add('cascade');
                el.style.setProperty('--i', i + c * 2);
            });
        });
    });

    function select(index, { focus = false } = {}) {
        const dir = index > current ? 'next' : index < current ? 'prev' : null;
        tabs.forEach((tab, i) => {
            const on = i === index;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', String(on));
            tab.tabIndex = on ? 0 : -1;
        });
        panels.forEach((panel, i) => {
            const on = i === index;
            if (on && dir) panel.dataset.dir = dir;
            panel.classList.toggle('is-active', on);
            panel.hidden = !on;
        });
        current = index;
        placeIndicator(false);
        if (focus) tabs[index].focus();
        if (Bus.focusCluster) Bus.focusCluster(tabs[index].dataset.cluster || null);
    }

    placeIndicator(true);
    const replace = rafThrottle(() => placeIndicator(true));
    if ('ResizeObserver' in window) new ResizeObserver(replace).observe(rail);
    window.addEventListener('resize', replace);
    if (document.fonts) document.fonts.ready.then(replace);

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(i));
        tab.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = tabs.length - 1;
            if (next === null) return;
            e.preventDefault();
            select(next, { focus: true });
        });
    });

    // No auto-advance. The selected tab is the user's declared state; rotating it
    // every 4.2s hijacked a role="tablist" exactly while someone was reading.
}

/* ==========================================================================
   Scroll reveal
   ========================================================================== */
function initScrollReveal() {
    const targets = [];
    const mark = (el, i, stepMs, blur) => {
        el.classList.add('reveal');
        if (blur) el.classList.add('reveal-blur');
        if (i) el.style.setProperty('--reveal-delay', `${Math.min(i, 12) * stepMs}ms`);
        targets.push(el);
    };

    // Section heads: eyebrow, title, lede land one after another. Titles
    // come in out of a blur.
    document.querySelectorAll('.section-head, .footer > .section-container').forEach(head => {
        head.querySelectorAll('.eyebrow, .section-title, .section-lede, .head-link, .footer-title, .footer-lede')
            .forEach((el, i) => mark(el, i, 80, el.matches('.section-title, .footer-title')));
    });

    // Whole blocks.
    document.querySelectorAll(
        '.stats-bar, .tool-marquee, .rail-wrap, .stage-panels, .constellation-wrap, .skills-filter-toolbar, ' +
        '.footer-links, .footer-wordmark'
    ).forEach(el => mark(el, 0, 0));

    // Sets: stagger by position within their own set, not across the page.
    ['.exp-list > .exp-item', '.credentials > .cred-block',
     '.stack-lists > .stack-group', '.proj-grid > .proj-card'].forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => mark(el, i, 45));
    });

    // Small things inside a revealed block cascade in after it; CSS keys the
    // animation off the block's .in-view.
    [['.stack-group', '.chip-tool'], ['.exp-item', '.exp-tags span'],
     ['.cred-block', '.cert-list li'], ['.proj-card', '.proj-tags span']].forEach(([block, sel]) => {
        document.querySelectorAll(block).forEach(b => {
            b.querySelectorAll(sel).forEach((el, i) => {
                el.classList.add('stagger');
                el.style.setProperty('--i', i);
            });
        });
    });

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in-view'));
        return;
    }

    // Once the entrance transition ends, drop .reveal so the element's own
    // transitions (hover lifts, border fades) are back in charge. .in-view
    // stays — it's the hook for one-shot effects like the rail fill.
    function settle(el) {
        el.addEventListener('transitionend', function done(e) {
            if (e.target !== el || e.propertyName !== 'opacity') return;
            el.removeEventListener('transitionend', done);
            el.classList.remove('reveal', 'reveal-blur');
        });
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            io.unobserve(el);
            if (!REDUCE_MOTION) settle(el);
            el.classList.add('in-view');
            el.dispatchEvent(new CustomEvent('reveal'));
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
}

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');

    if (navbar) {
        const onScroll = () => {
            const scrolled = window.scrollY > 20;
            navbar.classList.toggle('is-scrolled', scrolled);
            document.documentElement.classList.toggle('scrolled', scrolled);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (toggle && links) {
        const cta = document.querySelector('.nav-cta');
        // Stagger index for the menu's open cascade.
        links.querySelectorAll('.nav-link').forEach((a, i) => a.style.setProperty('--i', i));
        const isOpen = () => links.classList.contains('mobile-open');

        // Tab ring in visual order. The Resume CTA is inside it because it stays
        // visible and clickable while the panel is open - trapping around it
        // would strand a real control.
        const ring = () => [...links.querySelectorAll('a'), ...(cta ? [cta] : []), toggle];

        function onKeydown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                toggle.focus();               // focus goes back to the trigger
                return;
            }
            if (e.key !== 'Tab') return;
            const items = ring();
            const i = items.indexOf(document.activeElement);
            if (i === -1) return;             // focus escaped; let the browser handle it
            e.preventDefault();
            items[e.shiftKey ? (i - 1 + items.length) % items.length
                             : (i + 1) % items.length].focus();
        }

        function onOutside(e) {
            if (links.contains(e.target) || toggle.contains(e.target)) return;
            setOpen(false);   // no focus restore - the user is pointing elsewhere on purpose
        }

        function setOpen(open) {
            links.classList.toggle('mobile-open', open);
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
            if (open) {
                document.addEventListener('keydown', onKeydown, true);
                document.addEventListener('pointerdown', onOutside, true);
                const first = links.querySelector('a');
                if (first) first.focus();
            } else {
                document.removeEventListener('keydown', onKeydown, true);
                document.removeEventListener('pointerdown', onOutside, true);
            }
        }

        toggle.addEventListener('click', () => setOpen(!isOpen()));
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => { if (isOpen()) setOpen(false); });
        });

        // Resizing past the breakpoint while open would strand the panel.
        window.matchMedia('(min-width: 901px)')
            .addEventListener('change', e => { if (e.matches && isOpen()) setOpen(false); });
    }

    // Scrollspy - one observer, zero layout reads per scroll event.
    // Selector includes .footer[id] because the footer is a sibling of <main>.
    const sections = Array.from(document.querySelectorAll('main section[id], .footer[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        const linkFor = new Map(
            navLinks.map(l => [(l.getAttribute('href') || '').replace(/^#/, ''), l])
        );
        const visible = new Set();

        const paint = () => {
            // `sections` is in document order, so the first visible one is topmost.
            const winner = sections.find(s => visible.has(s.id));
            navLinks.forEach(l => l.classList.remove('active'));
            const link = winner && linkFor.get(winner.id);
            if (link) link.classList.add('active');
            if (Bus.navIndicate) Bus.navIndicate();
        };

        const spy = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) visible.add(e.target.id);
                else visible.delete(e.target.id);
            });
            paint();
        }, { rootMargin: '-68px 0px -55% 0px', threshold: 0 });

        sections.forEach(s => spy.observe(s));
    }
}

/* ==========================================================================
   Nav indicator — one underline that glides between links
   ========================================================================== */
function initNavIndicator() {
    const wrap = document.getElementById('navLinks');
    const bar = wrap && wrap.querySelector('.nav-indicator');
    if (!bar) return;

    const INSET = 13;   // matches .nav-link's horizontal padding
    let hovered = null;

    function place() {
        const link = hovered || wrap.querySelector('.nav-link.active');
        if (!link) { bar.classList.remove('is-on'); return; }
        // Appearing from nothing should fade in where it is, not slide in
        // from wherever it was last parked.
        const fromHidden = !bar.classList.contains('is-on');
        if (fromHidden) bar.style.transition = 'none';
        bar.style.width = (link.offsetWidth - INSET * 2) + 'px';
        bar.style.translate = (link.offsetLeft + INSET) + 'px 0';
        if (fromHidden) {
            void bar.offsetWidth;
            bar.style.transition = '';
        }
        bar.classList.add('is-on');
    }

    wrap.addEventListener('pointerover', (e) => {
        const link = closestTo(e.target, '.nav-link');
        if (link && link !== hovered) { hovered = link; place(); }
    });
    wrap.addEventListener('pointerleave', () => { hovered = null; place(); });
    wrap.addEventListener('focusin', (e) => {
        if (e.target.matches('.nav-link')) { hovered = e.target; place(); }
    });
    wrap.addEventListener('focusout', () => { hovered = null; place(); });

    Bus.navIndicate = place;
    window.addEventListener('resize', rafThrottle(place));
    if (document.fonts) document.fonts.ready.then(place);
}

/* ==========================================================================
   Scroll progress hairline
   ========================================================================== */
function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const update = rafThrottle(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.scale = `${p.toFixed(4)} 1`;
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

/* ==========================================================================
   Cursor glow — an ambient pool that trails the pointer
   ========================================================================== */
function initCursorGlow() {
    const el = document.querySelector('.bg-spotlight');
    if (!el || !FINE_POINTER || REDUCE_MOTION) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, placed = false;

    // Lerp toward the pointer, and stop scheduling frames once it's caught up.
    function tick() {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        el.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    }

    onPointer(({ x, y, target }) => {
        if (!target) { el.classList.remove('is-on'); return; }
        tx = x; ty = y;
        if (!placed) { cx = x; cy = y; placed = true; }
        el.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(tick);
    });
}

/* ==========================================================================
   Spotlight cards — a radial fill and border ring that follow the pointer
   ========================================================================== */
function initSpotlight() {
    document.querySelectorAll('.proj-card, .stat-item, .stage-panel, .stack-group, .cred-card')
        .forEach(el => el.classList.add('spot'));
    if (!FINE_POINTER) return;

    onPointer(({ x, y, target }) => {
        const el = closestTo(target, '.spot');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(x - r.left).toFixed(1)}px`);
        el.style.setProperty('--my', `${(y - r.top).toFixed(1)}px`);
    });
}

/* ==========================================================================
   Magnetic controls — a small pull toward the cursor, sprung back on leave
   ========================================================================== */
function initMagnetic() {
    if (!FINE_POINTER || REDUCE_MOTION) return;

    const SEL = '.btn, .nav-cta, .hero-social-link, .footer-link, .px-btn';
    const MAX = 6, PULL = 0.25;
    let active = null, tx = 0, ty = 0;

    function release() {
        if (active) active.style.translate = '';
        active = null; tx = 0; ty = 0;
    }

    onPointer(({ x, y, target }) => {
        const el = closestTo(target, SEL);
        if (el !== active) { release(); active = el; }
        if (!el) return;
        // The rect already includes the pull we applied last frame; take it
        // back out so the element doesn't chase its own offset.
        const r = el.getBoundingClientRect();
        const clamp = v => Math.max(-MAX, Math.min(MAX, v * PULL));
        tx = clamp(x - (r.left + r.width / 2 - tx));
        ty = clamp(y - (r.top + r.height / 2 - ty));
        el.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
    });
}

/* ==========================================================================
   Tilt — a gentle 3D lean toward the cursor, with a glare highlight
   ========================================================================== */
function initTilt() {
    if (!FINE_POINTER || REDUCE_MOTION) return;

    document.querySelectorAll('.profile-card, .snapshot, .resume-preview')
        .forEach(el => el.classList.add('tilt'));

    const MAX = 5;   // degrees
    let active = null;

    function release() {
        if (!active) return;
        active.classList.remove('is-tilting');
        ['--rx', '--ry', '--gx', '--gy'].forEach(p => active.style.removeProperty(p));
        active = null;
    }

    onPointer(({ x, y, target }) => {
        const el = closestTo(target, '.tilt');
        if (el !== active) { release(); active = el; }
        if (!el) return;
        el.classList.add('is-tilting');
        const r = el.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (x - r.left) / r.width));
        const py = Math.min(1, Math.max(0, (y - r.top) / r.height));
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
}

/* ==========================================================================
   Experience timeline — the path fills as you read down it
   ========================================================================== */
function initTimelineProgress() {
    const list = document.querySelector('.exp-list');
    if (!list || REDUCE_MOTION) return;
    const markers = list.querySelectorAll('.exp-marker');
    if (markers.length < 2) return;

    let top = 0, len = 1;

    // Walk offsetTop up to the list rather than using getBoundingClientRect:
    // the items are mid-reveal (and translated) when this first runs.
    function dotY(marker) {
        const dot = marker.querySelector('span');
        let y = dot.offsetHeight / 2;
        for (let el = dot; el && el !== list; el = el.offsetParent) y += el.offsetTop;
        return y;
    }
    function measure() {
        top = dotY(markers[0]);
        len = Math.max(1, dotY(markers[markers.length - 1]) - top);
        list.style.setProperty('--exp-top', `${top}px`);
        list.style.setProperty('--exp-len', `${len}px`);
        update();
    }
    // The fill's leading edge follows a line 60% of the way down the viewport.
    const update = rafThrottle(() => {
        const edge = window.innerHeight * 0.6 - (list.getBoundingClientRect().top + top);
        list.style.setProperty('--exp-p', Math.min(1, Math.max(0, edge / len)).toFixed(4));
    });

    let listening = false;
    whenVisible(list, (vis) => {
        if (vis === listening) return;
        listening = vis;
        if (vis) { window.addEventListener('scroll', update, { passive: true }); update(); }
        else window.removeEventListener('scroll', update);
    });

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(rafThrottle(measure)).observe(list);
    window.addEventListener('load', measure);
}

/* ==========================================================================
   Eyebrow decode — mono labels resolve out of random glyphs
   The real text stays in an .sr-only span; only an aria-hidden copy moves.
   ========================================================================== */
function initDecode() {
    if (REDUCE_MOTION) return;
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#%+*';

    function decode(node, text) {
        const start = performance.now();
        const DURATION = 520, SWAP = 45;   // ms; new glyphs every SWAP ms
        let lastSwap = 0;
        function frame(now) {
            const t = (now - start) / DURATION;
            if (t >= 1) { node.textContent = text; return; }
            if (now - lastSwap >= SWAP) {
                lastSwap = now;
                let out = '';
                for (let i = 0; i < text.length; i++) {
                    const ch = text[i];
                    // Characters lock in left to right.
                    const settled = ch === ' ' || t >= 0.2 + (i / text.length) * 0.8;
                    out += settled ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
                }
                node.textContent = out;
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    document.querySelectorAll('.eyebrow, .hero-eyebrow').forEach(el => {
        const text = el.textContent.trim();
        if (!text) return;
        const real = document.createElement('span');
        real.className = 'sr-only';
        real.textContent = text;
        const shown = document.createElement('span');
        shown.setAttribute('aria-hidden', 'true');
        shown.textContent = text;
        el.replaceChildren(real, shown);

        const run = () => decode(shown, text);
        // Scroll-revealed eyebrows decode as they arrive; the projects page
        // hero eyebrow is above the fold, so it just goes.
        if (el.classList.contains('eyebrow')) el.addEventListener('reveal', run, { once: true });
        else setTimeout(run, 200);
    });
}

/* ==========================================================================
   Tool marquee — clone the list so the loop is seamless
   ========================================================================== */
function initMarquee() {
    const track = document.querySelector('.marquee-track');
    const group = track && track.querySelector('.marquee-group');
    if (!group || REDUCE_MOTION) return;   // reduced motion keeps the static wrapped row
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    track.classList.add('is-animated');
}

/* ==========================================================================
   Hero terminal typing loop
   ========================================================================== */
function initTypingEffect() {
    const el = document.querySelector('.terminal-text');
    if (!el) return;

    const phrases = [
        ' turning data into decisions.',
        ' three internships, three domains.',
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
                else {
                    el.textContent = text;
                    el.classList.add('is-landed');   // small spring settle
                }
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
   Toast Notification System
   ========================================================================== */
function showToast(message, icon = '✓') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const pill = document.createElement('div');
    pill.className = 'toast-pill';
    pill.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(pill);
    requestAnimationFrame(() => pill.classList.add('is-visible'));
    setTimeout(() => {
        pill.classList.remove('is-visible');
        setTimeout(() => pill.remove(), 300);
    }, 3200);
}

/* ==========================================================================
   Web Audio Synthesizer Haptics (Apple / Linear Micro-tactile)
   ========================================================================== */
let audioCtx = null;
let hapticsEnabled = false;

function playHaptic(type = 'tap') {
    if (!hapticsEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'tap') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.015);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
            osc.start(now);
            osc.stop(now + 0.015);
        } else if (type === 'pop') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.025);
            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
            osc.start(now);
            osc.stop(now + 0.025);
        } else if (type === 'chime') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        }
    } catch (e) {
        // AudioContext not supported or permission denied
    }
}

function initAudioHaptics() {
    const btn = document.getElementById('audioToggleBtn');
    if (!btn) return;
    const offIcon = btn.querySelector('.audio-icon-off');
    const onIcon = btn.querySelector('.audio-icon-on');

    const saved = localStorage.getItem('soumik_audio_haptics');
    if (saved === 'true') {
        hapticsEnabled = true;
        btn.classList.add('is-active');
        btn.title = 'Haptic Audio: On';
        if (offIcon) offIcon.style.display = 'none';
        if (onIcon) onIcon.style.display = 'block';
    }

    btn.addEventListener('click', () => {
        hapticsEnabled = !hapticsEnabled;
        localStorage.setItem('soumik_audio_haptics', hapticsEnabled);
        btn.classList.toggle('is-active', hapticsEnabled);
        btn.title = hapticsEnabled ? 'Haptic Audio: On' : 'Haptic Audio: Off';
        if (offIcon) offIcon.style.display = hapticsEnabled ? 'none' : 'block';
        if (onIcon) onIcon.style.display = hapticsEnabled ? 'block' : 'none';
        if (hapticsEnabled) {
            playHaptic('chime');
            showToast('Tactile audio feedback enabled', '🔊');
        } else {
            showToast('Tactile audio muted', '🔇');
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('button, .nav-link, .chip-tool, .stack-tab, .c-filter-btn, .q-filter-btn, .stage')) {
            playHaptic('tap');
        }
    }, { passive: true });
}

/* ==========================================================================
   Live Regional Telemetry Clocks (IST Synchronization)
   ========================================================================== */
function initLiveClocks() {
    function update() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istDate = new Date(utc + istOffset);
        const hours = String(istDate.getHours()).padStart(2, '0');
        const minutes = String(istDate.getMinutes()).padStart(2, '0');
        const seconds = String(istDate.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds} IST`;

        const heroClock = document.getElementById('heroLiveClock');
        if (heroClock) {
            const digits = heroClock.querySelector('.clock-digits');
            if (digits) digits.textContent = `${hours}:${minutes} IST`;
        }

        const tzClock = document.getElementById('liveTzClock');
        if (tzClock) {
            tzClock.textContent = `Kolkata · ${timeStr} (UTC+5:30)`;
        }
    }
    update();
    setInterval(update, 1000);
}

/* ==========================================================================
   Card Spotlight Physics (Linear/Stripe hardware-accelerated follow)
   ========================================================================== */
function initCardSpotlight() {
    if (!FINE_POINTER) return;
    const cards = document.querySelectorAll('[data-spotlight="card"]');
    cards.forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--spot-x', `${x}px`);
            card.style.setProperty('--spot-y', `${y}px`);
        });
    });
}

/* ==========================================================================
   Interactive Hero Terminal CLI
   ========================================================================== */
function initInteractiveTerminal() {
    const box = document.getElementById('heroTerminalBox');
    if (!box) return;

    const copyBtn = document.getElementById('terminalCopyBtn');
    const typeTarget = document.getElementById('terminalTypeTarget');
    const responseBox = document.getElementById('terminalResponse');
    const chips = box.querySelectorAll('.t-chip');

    const commands = {
        metrics: `✓ 30+ production projects & analytics pipelines shipped\n✓ 3 internships: finance, business & public data\n✓ 6 verified credentials (Google, Vanderbilt, Michigan)\n✓ 100M+ distributed rows scale tested`,
        stack: `→ Big Data: Apache Spark, Kafka, Databricks, Delta Lake, Airflow\n→ Data Science: Polars, Scikit-Learn, XGBoost, Pandas, Optuna\n→ AI / ML: PyTorch, Transformers, LangChain, Vector DBs, vLLM\n→ Infra: Docker, Kubernetes, MLflow, FastAPI, TimescaleDB, AWS/GCP`,
        pipeline: `⚡ Pipeline status: OPTIMAL\n  • Ingestion: Kafka event stream active (8.4k evt/sec)\n  • Compute: Spark cluster memory usage 42%\n  • Storage: Delta Lakehouse ACID parity verified\n  • Inference: PyTorch tensor latency: 1.2ms`,
        clear: ''
    };

    function runCmd(cmd) {
        playHaptic('pop');
        if (cmd === 'clear') {
            if (responseBox) {
                responseBox.hidden = true;
                responseBox.textContent = '';
            }
            if (typeTarget) typeTarget.textContent = 'turning data into decisions.';
            return;
        }

        if (typeTarget) typeTarget.textContent = cmd;
        if (responseBox) {
            responseBox.hidden = false;
            responseBox.textContent = commands[cmd] || `command not recognized: ${cmd}`;
        }
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.dataset.cmd;
            runCmd(cmd);
        });
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            playHaptic('tap');
            const textToCopy = responseBox && !responseBox.hidden && responseBox.textContent 
                ? responseBox.textContent 
                : (typeTarget ? `soumik@analytics:~$ ${typeTarget.textContent}` : 'soumik@analytics:~$ turning data into decisions.');
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Terminal output copied to clipboard', '📋');
            }).catch(() => {
                showToast('Copied to clipboard', '📋');
            });
        });
    }
}

/* ==========================================================================
   ATS Résumé Quick-View Modal
   ========================================================================== */
function initResumeModal() {
    const modal = document.getElementById('pdfModal');
    if (!modal) return;
    const closeBtn = document.getElementById('pdfModalClose');
    const triggers = [
        document.getElementById('quickResumePreviewBtn'),
        document.getElementById('resumePreviewOverlayBtn'),
        document.getElementById('resumeQuickViewBtn')
    ];

    function openModal() {
        playHaptic('chime');
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        playHaptic('tap');
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    triggers.forEach(btn => {
        if (btn) btn.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    const dlBtn = document.getElementById('resumeDownloadBtn');
    if (dlBtn) {
        dlBtn.addEventListener('click', () => {
            showToast('Downloading Soumik_resume.pdf...', '📄');
        });
    }
}

/* ==========================================================================
   Project Technical Architecture Deep-Dive Modal
   ========================================================================== */
const PROJECT_DATA = {
    'omni-terminal': {
        title: 'Omni Terminal — Financial Intelligence Platform',
        kind: 'Full-Stack Platform · Stage 03',
        desc: 'Production-grade financial terminal built specifically for Indian equity and derivatives traders. Delivers sub-100ms real-time candlestick charts, multi-parameter technical screeners, and automated risk metrics across 100k+ historical ticks.',
        metrics: [
            { val: '<100ms', lbl: 'Chart Render Latency' },
            { val: '100k+', lbl: 'Ticks Stored & Screened' },
            { val: '100%', lbl: 'Async Microservice Uptime' }
        ],
        architecture: 'React (Vite) + Tailwind frontend connecting via WebSockets and REST to a high-concurrency FastAPI microservice. Backed by PostgreSQL with TimescaleDB hypertable partitioning for time-series tick compression, plus an in-memory Redis layer for ticker caching.',
        tags: ['React', 'Vite', 'FastAPI', 'PostgreSQL', 'TimescaleDB', 'Redis', 'WebSockets', 'Tailwind CSS'],
        live: 'https://omni-terminal-nu.vercel.app',
        github: 'https://github.com/soumikbelel3-commits/omni-terminal'
    },
    'trader-behavior': {
        title: 'Trader Behavior & Performance Analysis',
        kind: 'Quantitative Analytics · Finance',
        desc: 'Comprehensive exploratory and statistical audit of individual trader transaction logs. Isolated behavioral biases (loss aversion, overtrading, disposition effect) that statistically separate profitable accounts from unprofitable cohorts.',
        metrics: [
            { val: '35+', lbl: 'Trading Metrics Modeled' },
            { val: '2.41', lbl: 'Top Quartile Sharpe' },
            { val: '3 Cohorts', lbl: 'Behavioral Clusters' }
        ],
        architecture: 'Pandas & NumPy data pipeline for transaction log normalization and P&L attribution. SQL CTEs compute rolling drawdowns and win/loss payoff ratios. Visualized via an interactive Power BI drill-down suite with custom DAX parameters.',
        tags: ['Python', 'SQL', 'Power BI', 'DAX', 'Pandas', 'Financial Modeling'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    },
    'supply-chain': {
        title: 'Global Supply Chain Risk Analysis',
        kind: 'Analytics Engineering · Logistics',
        desc: 'Multi-echelon supply chain resilience platform modelling supplier disruption, route transit volatility, and inventory stock-out risks across global trade nodes.',
        metrics: [
            { val: '5 Tiers', lbl: 'Disruption Risk Index' },
            { val: '14 Routes', lbl: 'Bottlenecks Flagged' },
            { val: '100k+', lbl: 'Supply Rows Processed' }
        ],
        architecture: 'PostgreSQL data pipeline with automated schema cleaning. Power BI star-schema dimensional modeling with DAX measures driving interactive geographic and supplier drill-downs.',
        tags: ['Python', 'SQL', 'Power BI', 'Data Modeling', 'ETL'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    },
    'financial-performance': {
        title: 'Financial Performance Analysis & Dashboard',
        kind: 'Corporate Finance · Executive BI',
        desc: 'Automated executive reporting layer synthesizing revenue trajectories, gross margin expansion, overhead cost variance, and EBITDA waterfalls across multi-period accounting sheets.',
        metrics: [
            { val: '12+', lbl: 'Dynamic DAX Measures' },
            { val: '100%', lbl: 'Automated Refresh' },
            { val: 'Variance', lbl: 'Waterfall Decomposition' }
        ],
        architecture: 'Power Query automated transformation pipelines ingestion from raw balance sheet & P&L exports. Built-in time intelligence (YoY, MoM, QoQ) using robust DAX measures.',
        tags: ['Power BI', 'DAX', 'Excel', 'Python', 'Financial Analytics'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    },
    'hr-attrition': {
        title: 'HR Analytics — Employee Attrition Classifier',
        kind: 'Predictive ML & Analytics · People Ops',
        desc: 'Supervised classification model analyzing workforce telemetry (tenure, satisfaction, compensation bands, overtime) to forecast individual employee attrition likelihood and isolate primary turnover catalysts.',
        metrics: [
            { val: '0.89', lbl: 'ROC-AUC Classification' },
            { val: '15+', lbl: 'Features Engineered' },
            { val: 'Top 3', lbl: 'Drivers Isolated' }
        ],
        architecture: 'End-to-end scikit-learn pipeline featuring SMOTE class balancing, Random Forest & Logistic Regression cross-validation, and SHAP value feature importance ranking. Packaged into a Power BI executive retention simulator.',
        tags: ['Python', 'scikit-learn', 'Machine Learning', 'Power BI', 'Classification'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    },
    'customer-segmentation': {
        title: 'Customer Segmentation Analysis (RFM + K-Means)',
        kind: 'Statistical Learning · Stage 02',
        desc: 'Unsupervised machine learning model performing RFM (Recency, Frequency, Monetary) cohort clustering on e-commerce transaction streams to distinguish champions, at-risk buyers, and high-value opportunities.',
        metrics: [
            { val: '4 Clusters', lbl: 'Optimal K-Means (Elbow)' },
            { val: '32%', lbl: 'Retention Lift Opportunity' },
            { val: '10k+', lbl: 'Customer Records' }
        ],
        architecture: 'Data normalization and Box-Cox transformations in Python/NumPy followed by Scikit-Learn K-Means clustering with silhouette score verification. Results exported to interactive Power BI / Excel dashboards.',
        tags: ['Python', 'scikit-learn', 'Clustering', 'K-Means', 'Excel'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    },
    'sales-dashboard': {
        title: 'Sales Performance Dashboard',
        kind: 'Business Intelligence · Enterprise',
        desc: 'Intuitive visual intelligence system turning raw sales transactions into actionable revenue insights for operational and regional leadership.',
        metrics: [
            { val: 'Multi-Region', lbl: 'Geographic Breakdown' },
            { val: 'Dynamic', lbl: 'Product Line Slicers' },
            { val: '100%', lbl: 'Zero Code Notebook Interface' }
        ],
        architecture: 'Star schema relational design in Power BI and Tableau. Includes calculated parameters, LOD expressions, and executive card KPIs.',
        tags: ['Power BI', 'Tableau', 'Excel', 'Business Intelligence'],
        live: null,
        github: 'https://github.com/soumikbelel3-commits'
    }
};

function initProjectModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    const closeBtn = document.getElementById('projectModalClose');
    const content = document.getElementById('projectModalContent');

    function openProject(id) {
        const p = PROJECT_DATA[id];
        if (!p) return;
        playHaptic('chime');

        content.innerHTML = `
            <div class="pm-header">
                <div class="pm-top-tags">
                    <span class="pm-kind-pill">${p.kind}</span>
                </div>
                <h3 class="pm-title">${p.title}</h3>
                <p class="pm-desc">${p.desc}</p>
            </div>

            <div class="pm-metrics-grid">
                ${p.metrics.map(m => `
                    <div class="pm-metric-box">
                        <span class="pm-metric-val">${m.val}</span>
                        <span class="pm-metric-lbl">${m.lbl}</span>
                    </div>
                `).join('')}
            </div>

            <div>
                <h4 class="pm-section-title">Technical Architecture &amp; Implementation</h4>
                <p class="pm-desc" style="font-size: 14px;">${p.architecture}</p>
            </div>

            <div>
                <h4 class="pm-section-title">Technologies &amp; Libraries</h4>
                <div class="pm-tech-chips">
                    ${p.tags.map(t => `<span class="pm-tech-chip">${t}</span>`).join('')}
                </div>
            </div>

            <div class="pm-actions">
                ${p.live ? `
                    <a href="${p.live}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                        <span>Launch Live App</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                ` : ''}
                ${p.github ? `
                    <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        <span>GitHub Repository</span>
                    </a>
                ` : ''}
            </div>
        `;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        playHaptic('tap');
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.proj-inspect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.projectId;
            openProject(id);
        });
    });

    document.querySelectorAll('.proj-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            const id = card.dataset.projectId;
            if (id) openProject(id);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   Command Palette (⌘K / Ctrl+K HUD)
   ========================================================================== */
function initCommandPalette() {
    const palette = document.getElementById('cmdPalette');
    if (!palette) return;
    const input = document.getElementById('cmdInput');
    const results = document.getElementById('cmdResults');
    const triggerBtn = document.getElementById('cmdKTrigger');
    const heroBtn = document.getElementById('heroCmdKBtn');

    const ITEMS = [
        // Navigation
        { group: 'Navigation', text: 'Hero & Live Overview', sub: 'Top of page', badge: 'Section', action: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
        { group: 'Navigation', text: 'Career Journey (5 Stages)', sub: 'Data Analyst → AI Engineer', badge: 'Section', action: () => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }) },
        { group: 'Navigation', text: 'Experience & Credentials', sub: '3 Internships · Calcutta University · 6 Certs', badge: 'Section', action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }) },
        { group: 'Navigation', text: 'Capability Graph & Skills', sub: 'Interactive neural topology', badge: 'Section', action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }) },
        { group: 'Navigation', text: 'Shipped Projects & Work', sub: 'Omni Terminal & analytics cases', badge: 'Section', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
        { group: 'Navigation', text: 'Contact & Inquiries', sub: 'soumikbelel3@gmail.com', badge: 'Section', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },

        // Actions
        { group: 'Actions', text: 'Inspect ATS Résumé', sub: 'View embedded single-page PDF', badge: 'Modal', action: () => document.getElementById('quickResumePreviewBtn')?.click() },
        { group: 'Actions', text: 'Download Résumé (PDF)', sub: 'ATS verified format', badge: 'File', action: () => {
            const a = document.createElement('a');
            a.href = 'Soumik_resume.pdf';
            a.download = 'Soumik_resume.pdf';
            a.click();
            showToast('Downloading Soumik_resume.pdf...', '📄');
        } },
        { group: 'Actions', text: 'Copy Email Address', sub: 'soumikbelel3@gmail.com', badge: 'Clipboard', action: () => {
            navigator.clipboard.writeText('soumikbelel3@gmail.com');
            showToast('Email copied: soumikbelel3@gmail.com', '📋');
        } },
        { group: 'Actions', text: 'Copy LinkedIn Profile', sub: 'linkedin.com/in/soumik-belel', badge: 'Clipboard', action: () => {
            navigator.clipboard.writeText('https://www.linkedin.com/in/soumik-belel');
            showToast('LinkedIn copied to clipboard', '📋');
        } },
        { group: 'Actions', text: 'Toggle Haptic Audio Feedback', sub: 'Tactile Web Audio synthesizer', badge: 'Setting', action: () => document.getElementById('audioToggleBtn')?.click() },

        // Projects
        { group: 'Projects', text: 'Omni Terminal', sub: 'Full-stack trading terminal (FastAPI + TimescaleDB + React)', badge: 'Project', action: () => document.querySelector('[data-project-id="omni-terminal"]')?.click() },
        { group: 'Projects', text: 'Trader Behavior Analysis', sub: 'Behavioral clustering & P&L drivers', badge: 'Project', action: () => document.querySelector('[data-project-id="trader-behavior"]')?.click() },
        { group: 'Projects', text: 'Global Supply Chain Risk', sub: 'Multi-echelon supplier disruption dashboard', badge: 'Project', action: () => document.querySelector('[data-project-id="supply-chain"]')?.click() },
        { group: 'Projects', text: 'HR Attrition Classifier', sub: 'scikit-learn 0.89 ROC-AUC predictive model', badge: 'Project', action: () => document.querySelector('[data-project-id="hr-attrition"]')?.click() },
        { group: 'Projects', text: 'Customer Segmentation', sub: 'RFM cohort matrix & K-Means clustering', badge: 'Project', action: () => document.querySelector('[data-project-id="customer-segmentation"]')?.click() },

        // Skills Filter
        { group: 'Stack Filter', text: 'Filter: Big Data & Distributed', sub: 'Spark, Kafka, Databricks, Delta Lake', badge: 'Stack', action: () => {
            const tab = document.querySelector('[data-cluster="bigdata"]');
            if (tab) tab.click();
            document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        } },
        { group: 'Stack Filter', text: 'Filter: AI / ML & GenAI', sub: 'PyTorch, Transformers, LangChain, Vector DBs', badge: 'Stack', action: () => {
            const tab = document.querySelector('[data-cluster="ai"]');
            if (tab) tab.click();
            document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        } },
        { group: 'Stack Filter', text: 'Filter: Production Core Stack', sub: 'Shipped production tools', badge: 'Filter', action: () => {
            const q = document.querySelector('[data-filter="owned"]');
            if (q) q.click();
            document.getElementById('skillsFilterToolbar')?.scrollIntoView({ behavior: 'smooth' });
        } }
    ];

    let selectedIndex = 0;
    let filteredItems = [];

    function openPalette() {
        playHaptic('chime');
        palette.classList.add('is-open');
        palette.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        input.value = '';
        renderResults('');
        setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
        playHaptic('tap');
        palette.classList.remove('is-open');
        palette.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function renderResults(q) {
        const query = q.toLowerCase().trim();
        filteredItems = ITEMS.filter(item => {
            if (!query) return true;
            return item.text.toLowerCase().includes(query) ||
                   item.sub.toLowerCase().includes(query) ||
                   item.group.toLowerCase().includes(query);
        });

        selectedIndex = 0;

        if (!filteredItems.length) {
            results.innerHTML = `<div class="cmd-empty">No results matching "${q}". Try "resume", "spark", "projects" or "contact".</div>`;
            return;
        }

        let html = '';
        let lastGroup = '';

        filteredItems.forEach((item, index) => {
            if (item.group !== lastGroup) {
                lastGroup = item.group;
                html += `<div class="cmd-group-label">${lastGroup}</div>`;
            }
            html += `
                <div class="cmd-item ${index === selectedIndex ? 'is-selected' : ''}" data-index="${index}">
                    <div class="cmd-item-left">
                        <span class="cmd-item-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <div>
                            <span class="cmd-item-text">${item.text}</span>
                            <span class="cmd-item-sub">${item.sub}</span>
                        </div>
                    </div>
                    <span class="cmd-item-badge">${item.badge}</span>
                </div>
            `;
        });

        results.innerHTML = html;

        results.querySelectorAll('.cmd-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index, 10);
                executeItem(idx);
            });
            el.addEventListener('mouseenter', () => {
                selectedIndex = parseInt(el.dataset.index, 10);
                updateSelected();
            });
        });
    }

    function updateSelected() {
        results.querySelectorAll('.cmd-item').forEach((el, idx) => {
            el.classList.toggle('is-selected', idx === selectedIndex);
            if (idx === selectedIndex) {
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function executeItem(idx) {
        const item = filteredItems[idx];
        if (item) {
            closePalette();
            setTimeout(() => item.action(), 100);
        }
    }

    input.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            playHaptic('tap');
            if (filteredItems.length) {
                selectedIndex = (selectedIndex + 1) % filteredItems.length;
                updateSelected();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            playHaptic('tap');
            if (filteredItems.length) {
                selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                updateSelected();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            playHaptic('pop');
            executeItem(selectedIndex);
        } else if (e.key === 'Escape') {
            closePalette();
        }
    });

    if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
    if (heroBtn) heroBtn.addEventListener('click', openPalette);

    palette.addEventListener('click', (e) => {
        if (e.target === palette) closePalette();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (palette.classList.contains('is-open')) closePalette();
            else openPalette();
        } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            openPalette();
        } else if (e.key === 'Escape' && palette.classList.contains('is-open')) {
            closePalette();
        }
    });
}

/* ==========================================================================
   Boot
   ========================================================================== */
/* Every init* null-guards its own elements, so projects.html runs this same
   list and simply skips what it doesn't have. */
document.addEventListener('DOMContentLoaded', () => {
    initNavIndicator();
    initNavigation();
    initScrollProgress();
    initSmoothScroll();
    initDecode();
    initMarquee();
    initSpotlight();
    initScrollReveal();
    initTypingEffect();
    animateCounters();
    initSpiralCanvas();
    initSnapshotTabs();
    initSkillsConstellation();
    initJourney();
    initTimelineProgress();
    initMagnetic();
    initTilt();
    initCursorGlow();
    initAudioHaptics();
    initLiveClocks();
    initCardSpotlight();
    initInteractiveTerminal();
    initResumeModal();
    initProjectModal();
    initCommandPalette();
});
