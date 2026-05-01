const cursorTexts = ['67', '✧', '♪', '♫', '谷', '清', '洋'];
const fallingTexts = ['67', '✧', '♪', '♫', '谷', '清', '洋'];

let lastCursorTime = 0;

// NEW: keep a reference so we don't accidentally start multiple intervals
let fallingIntervalId = null;

export function initCursor() {
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastCursorTime > 100) {
      createCursorText(e.pageX, e.pageY);
      lastCursorTime = now;
    }
  });
}

function createCursorText(x, y) {
  const text = document.createElement('div');
  text.className = 'cursor-text';
  text.textContent = cursorTexts[Math.floor(Math.random() * cursorTexts.length)];
  text.style.left = x + 'px';
  text.style.top = y + 'px';
  document.body.appendChild(text);
  setTimeout(() => text.remove(), 1000);
}

// NEW: remove all currently-falling symbols immediately
function clearFalling() {
  const fallingContainer = document.getElementById('falling-container');
  if (!fallingContainer) return;
  fallingContainer.querySelectorAll('.falling-text').forEach((el) => el.remove());
}

// NEW: hide/unhide the whole falling layer based on route
function syncFallingVisibility() {
  const fallingContainer = document.getElementById('falling-container');
  if (!fallingContainer) return;

  if (window.location.hash === '#me') {
    // instantly stop visuals on #me
    fallingContainer.style.display = 'none';
    clearFalling();
  } else {
    fallingContainer.style.display = '';
  }
}

export function initFallingText() {
  // prevent duplicate intervals if init is called again
  if (fallingIntervalId) return;

  // keep falling layer synced when navigating
  window.addEventListener('hashchange', syncFallingVisibility);
  syncFallingVisibility(); // run once on load

  fallingIntervalId = setInterval(() => {
    const hash = window.location.hash.slice(1) || '';
    if (hash === 'me') return;

    const fallingContainer = document.getElementById('falling-container');
    if (!fallingContainer) return;

    const text = document.createElement('div');
    text.className = 'falling-text';
    text.textContent = fallingTexts[Math.floor(Math.random() * fallingTexts.length)];

    // keep your original positioning logic (or swap to innerWidth if you want)
    text.style.left = Math.random() * 100 + '%';
    text.style.animationDuration = (3 + Math.random() * 4) + 's';
    text.style.fontSize = (12 + Math.random() * 12) + 'px';

    fallingContainer.appendChild(text);
    setTimeout(() => text.remove(), 8000);
  }, 300);
}
