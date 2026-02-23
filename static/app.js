function $(id) {
    return document.getElementById(id);
}

function initEmberfield() {
    const c = $("emberfield");
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = 0,
        h = 0,
        dpr = 1,
        embers = [];

    function resize() {
        dpr = window.devicePixelRatio || 1;
        w = Math.floor(window.innerWidth * dpr);
        h = Math.floor(window.innerHeight * dpr);
        c.width = w;
        c.height = h;
        c.style.width = "100%";
        c.style.height = "100%";
        const count = Math.min(170, Math.floor((window.innerWidth * window.innerHeight) / 15000));
        embers = Array.from({
            length: count
        }).map(() => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: (Math.random() * 1.4 + 0.25) * dpr,
            v: (Math.random() * 0.20 + 0.05) * dpr,
            a: Math.random() * 0.32 + 0.08,
            warm: Math.random() > 0.65
        }));
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        for (const e of embers) {
            e.y -= e.v;
            if (e.y < -10) {
                e.y = h + 10;
                e.x = Math.random() * w;
            }
            ctx.globalAlpha = e.a;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctx.fillStyle = e.warm ? "rgba(255,210,125,0.9)" : "rgba(255,122,24,0.85)";
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(tick);
}

function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                obs.unobserve(e.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });
    els.forEach(el => obs.observe(el));
}

function initMobileNav() {
    const toggle = $("navToggle");
    const menu = $("mobileMenu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => menu.classList.toggle("open"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
}

function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    const underline = $("tabUnderline");
    const output = $("output");
    if (!tabs.length || !underline || !output) return;

    const content = {
        about: [
            "ClawTerm is a terminal-first agent console.",
            "It turns objectives into runs: plan → execute → checkpoint.",
            "Use it as a clean MVP shell for an OpenClaw-style agent."
        ],
        caps: [
            "Modules:",
            "  - route selector: stable | guarded | fast",
            "  - proof armory: armed → verified",
            "  - checkpoint sealer: queued → sealed",
            "Commands:",
            "  deploy --objective \"...\"",
            "  probe  --objective \"...\"",
            "  audit  --objective \"...\""
        ],
        run: [
            "Tip: write commands like a real console.",
            "Examples:",
            "  deploy --objective \"Draft my product page\"",
            "  probe  --objective \"Summarize this idea into steps\"",
            "  audit  --objective \"Find risks and edge cases\""
        ],
        signals: [
            "Signals are designed to feel like a real runtime:",
            "  epoch  → increments over time",
            "  heat   → rises under load",
            "  route  → affects execution style",
            "  proof  → indicates verification readiness",
            "  checkpoint → shows persistence state"
        ]
    };

    function setUnderline(btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = btn.parentElement.getBoundingClientRect();
        const w = rect.width;
        const x = rect.left - parentRect.left;
        underline.style.width = `${Math.max(48, w-10)}px`;
        underline.style.transform = `translateX(${x + 5}px)`;
    }

    function writeBlock(lines) {
        output.innerHTML = "";
        lines.forEach((l) => {
            const div = document.createElement("div");
            div.textContent = l.startsWith("  ") ? l : `> ${l}`;
            if (l.endsWith(":") || l.startsWith("Modules:") || l.startsWith("Commands:")) div.className = "ok";
            output.appendChild(div);
        });
    }

    tabs.forEach(t => {
        t.addEventListener("click", () => {
            tabs.forEach(x => {
                x.classList.remove("active");
                x.setAttribute("aria-selected", "false");
            });
            t.classList.add("active");
            t.setAttribute("aria-selected", "true");
            setUnderline(t);

            const key = t.dataset.tab;
            if (content[key]) writeBlock(content[key]);
        });
    });

    const active = document.querySelector(".tab.active");
    if (active) setUnderline(active);
    window.addEventListener("resize", () => {
        const a = document.querySelector(".tab.active");
        if (a) setUnderline(a);
    });
}

function initTelemetry() {
    const mState = $("mState");
    const mEpoch = $("mEpoch");
    const mHeat = $("mHeat");
    const hudLine = $("hudLine");
    if (!mState || !mEpoch || !mHeat || !hudLine) return;

    let epoch = 52000 + Math.floor(Math.random() * 7000);
    let heat = 66 + Math.floor(Math.random() * 10);

    function tick() {
        epoch += Math.random() > 0.55 ? 1 : 0;
        heat += Math.random() > 0.72 ? 1 : (Math.random() > 0.78 ? -1 : 0);
        heat = Math.max(58, Math.min(96, heat));

        mEpoch.textContent = String(epoch);
        mHeat.textContent = `${heat}°`;
        mState.textContent = (heat > 90) ? "HOT" : "ARMED";

        const drift = (Math.random() * 0.003 - 0.001).toFixed(4);
        const coh = (0.74 + Math.random() * 0.22).toFixed(2);
        hudLine.textContent = `epoch: ${epoch} · drift: ${drift} · coherence: ${coh}`;
    }

    tick();
    setInterval(tick, 1200);
}

function initRunner() {
    const form = $("cmdForm");
    const cmd = $("cmd");
    const out = $("output");
    const btnClear = $("btnClear");
    const btnSeed = $("btnSeed");
    const chipBtns = document.querySelectorAll(".chipbtn");
    const tabs = document.querySelectorAll(".tab");
    if (!form || !cmd || !out) return;

    function print(text, cls = "") {
        const div = document.createElement("div");
        div.textContent = text.startsWith(">") ? text : `> ${text}`;
        if (cls) div.className = cls;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function parseCommand(s) {
        const trimmed = (s || "").trim();
        if (!trimmed) return null;
        if (trimmed === "help") return {
            mode: "help",
            objective: ""
        };

        const mode = trimmed.split(/\s+/)[0].toLowerCase();
        const m = trimmed.match(/--objective\s+"([^"]+)"/i) || trimmed.match(/--objective\s+(.+)$/i);
        const objective = m ? (m[1] || m[0].split(/--objective/i)[1]).trim().replace(/^"|"$/g, "") : "";
        return {
            mode,
            objective
        };
    }

    async function run(mode, objective) {
        print(`$ ${mode} --objective "${objective}"`, "dim");
        print("connecting to agent…", "dim");
        await delay(250);

        const res = await fetch("/api/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mode,
                objective
            })
        });
        const data = await res.json();
        if (!data.ok) {
            print(`error: ${data.error || "unknown"}`, "dim");
            return;
        }

        for (const step of data.steps) {
            await delay(520);
            print(step);
        }

        const t = data.telemetry;
        await delay(280);
        print(`telemetry: conf=${t.confidence} latency=${t.latency_ms}ms epoch=${t.epoch} heat=${t.heat}° route=${t.route} proof=${t.proof} checkpoint=${t.checkpoint}`, "ok");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const parsed = parseCommand(cmd.value);
        if (!parsed) return;

        const runTab = Array.from(tabs).find(t => t.dataset.tab === "run");
        if (runTab) runTab.click();

        if (parsed.mode === "help") {
            print("commands:", "ok");
            print("deploy --objective \"...\"");
            print("probe  --objective \"...\"");
            print("audit  --objective \"...\"");
            print("seal   --objective \"...\"");
            print("tip: use the quick commands on the right.", "dim");
            cmd.value = "";
            return;
        }

        if (!parsed.objective) {
            print("error: missing --objective", "dim");
            cmd.focus();
            return;
        }

        cmd.value = "";
        await run(parsed.mode, parsed.objective);
    });

    if (btnClear) {
        btnClear.addEventListener("click", () => {
            out.innerHTML = `<div class="dim">Cleared.</div><div class="dim">Type <span class="ok">help</span> or run: <span class="ok">deploy --objective "..."</span></div><div class="dim">—</div>`;
        });
    }

    if (btnSeed) {
        btnSeed.addEventListener("click", () => {
            cmd.value = `deploy --objective "Draft a 5-step MVP plan for a claw agent console"`;
            cmd.focus();
        });
    }

    chipBtns.forEach(b => {
        b.addEventListener("click", () => {
            cmd.value = b.dataset.cmd || "";
            cmd.focus();
        });
    });
}

(function boot() {
    initEmberfield();
    initReveal();
    initMobileNav();
    initTabs();
    initTelemetry();
    initRunner();
})();