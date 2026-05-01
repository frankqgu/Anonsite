// me-editor.js — simple Photoshop-like transform controls (move/resize/rotate)
let selected = null;
let action = null; // "move" | "resize" | "rotate"
let handleDir = null;

let start = {
    pointerX: 0,
    pointerY: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    rotation: 0,
    centerX: 0,
    centerY: 0,
    startAngle: 0,
};

function px(n) { return `${n}px`; }

function getRotationDeg(el) {
    const rot = parseFloat(el.dataset.rot || "0");
    return rot;
}

function setRotationDeg(el, deg) {
    el.dataset.rot = String(deg);
    el.style.transform = `rotate(${deg}deg)`;
}

function bringToFront(el) {
    // simple z-index bump
    const z = parseInt(el.style.zIndex || "1", 10);
    el.style.zIndex = String(Math.max(z, 1) + 1);
}

function deselect() {
    if (selected) selected.classList.remove("selected");
    selected = null;
}

function select(el) {
    if (selected && selected !== el) selected.classList.remove("selected");
    selected = el;
    selected.classList.add("selected");
    bringToFront(selected);
}

function elementCenter(el) {
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

function pointerPos(e) {
    return { x: e.clientX, y: e.clientY };
}

function clampSize(w, h) {
    const min = 40;
    return { w: Math.max(min, w), h: Math.max(min, h) };
}

function onPointerDown(e) {
    const target = e.target;

    // click empty area => deselect
    if (target.classList.contains("me-editor")) {
        deselect();
        return;
    }

    const item = target.closest(".me-item");
    if (!item) return;

    select(item);

    const { x, y } = pointerPos(e);
    start.pointerX = x;
    start.pointerY = y;
    start.left = parseFloat(item.style.left || "0");
    start.aspect = start.width / start.height;
    start.top = parseFloat(item.style.top || "0");
    start.width = parseFloat(item.style.width || item.getBoundingClientRect().width);
    start.height = parseFloat(item.style.height || item.getBoundingClientRect().height);
    start.rotation = getRotationDeg(item);

    // rotate?
    if (target.classList.contains("me-rotate")) {
        action = "rotate";
        const { cx, cy } = elementCenter(item);
        start.centerX = cx;
        start.centerY = cy;
        start.startAngle = Math.atan2(y - cy, x - cx);
        target.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
    }

    // resize?
    if (target.classList.contains("me-handle")) {
        action = "resize";
        handleDir = [...target.classList].find(c => ["nw", "n", "ne", "e", "se", "s", "sw", "w"].includes(c));
        target.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
    }

    // otherwise move
    action = "move";
    item.setPointerCapture(e.pointerId);
    e.preventDefault();
}

function onPointerMove(e) {
    if (!selected || !action) return;

    const { x, y } = pointerPos(e);
    const dx = x - start.pointerX;
    const dy = y - start.pointerY;

    /* ================= MOVE ================= */
    if (action === "move") {
        selected.style.left = px(start.left + dx);
        selected.style.top = px(start.top + dy);
        return;
    }

    /* ================= RESIZE ================= */
    if (action === "resize") {
        let left = start.left;
        let top = start.top;
        let w = start.width;
        let h = start.height;

        const keepAspect = e.shiftKey; // ✅ SHIFT locks aspect ratio
        const aspect = start.aspect || (start.width / start.height);

        // axis-aligned resize (pre-rotation, editor-style)
        if (handleDir.includes("e")) w = start.width + dx;
        if (handleDir.includes("s")) h = start.height + dy;
        if (handleDir.includes("w")) {
            w = start.width - dx;
            left = start.left + dx;
        }
        if (handleDir.includes("n")) {
            h = start.height - dy;
            top = start.top + dy;
        }

        // keep aspect ratio when shift is held
        if (keepAspect) {
            const corner = ["nw", "ne", "se", "sw"].includes(handleDir);

            if (corner) {
                const dw = Math.abs(w - start.width);
                const dh = Math.abs(h - start.height);

                if (dw >= dh) {
                    h = w / aspect;
                    if (handleDir.includes("n")) {
                        top = start.top + (start.height - h);
                    }
                } else {
                    w = h * aspect;
                    if (handleDir.includes("w")) {
                        left = start.left + (start.width - w);
                    }
                }
            } else {
                // edge handles: preserve center on opposite axis
                if (handleDir === "e" || handleDir === "w") {
                    h = w / aspect;
                    top = start.top + (start.height - h) / 2;
                    if (handleDir === "w") {
                        left = start.left + (start.width - w);
                    }
                }

                if (handleDir === "n" || handleDir === "s") {
                    w = h * aspect;
                    left = start.left + (start.width - w) / 2;
                    if (handleDir === "n") {
                        top = start.top + (start.height - h);
                    }
                }
            }
        }

        // clamp minimum size
        const min = 40;
        w = Math.max(min, w);
        h = Math.max(min, h);

        selected.style.left = px(left);
        selected.style.top = px(top);
        selected.style.width = px(w);
        selected.style.height = px(h);
        return;
    }

    /* ================= ROTATE ================= */
    if (action === "rotate") {
        const angle = Math.atan2(y - start.centerY, x - start.centerX);
        const delta = angle - start.startAngle;
        const deg = start.rotation + (delta * 180) / Math.PI;
        setRotationDeg(selected, deg);
        return;
    }
}
  

function onPointerUp() {
    action = null;
    handleDir = null;
}

export function initMeEditor(rootEl) {
    // rootEl is the .me-editor element
    rootEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // click outside editor => deselect
    window.addEventListener("mousedown", (e) => {
        if (!rootEl.contains(e.target)) deselect();
    });
}

export function makeMeItem(src, left = 80, top = 80, width = 220, height = 160) {
    const el = document.createElement("div");
    el.className = "me-item";
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${width}px`;     // ✅ custom size
    el.style.height = `${height}px`;   // ✅ custom size
    el.style.zIndex = "1";
    setRotationDeg(el, 0);

    el.innerHTML = `
      <img src="${src}" draggable="false" />
      <div class="me-rotate" title="rotate"></div>
  
      <div class="me-handle nw"></div>
      <div class="me-handle n"></div>
      <div class="me-handle ne"></div>
      <div class="me-handle e"></div>
      <div class="me-handle se"></div>
      <div class="me-handle s"></div>
      <div class="me-handle sw"></div>
      <div class="me-handle w"></div>
    `;

    return el;
}
  