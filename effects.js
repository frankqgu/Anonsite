const cursorTexts = ['67', '✧', '♪', '♫', '谷', '清', '洋'];
const fallingTexts = ['67', '✧', '♪', '♫', '谷', '清', '洋'];

let lastCursorTime = 0;

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

export function initFallingText() {
  setInterval(() => {
    const hash = window.location.hash.slice(1) || '';
    if (hash === 'me') return;

    const fallingContainer = document.getElementById('falling-container');
    if (!fallingContainer) return;

    const text = document.createElement('div');
    text.className = 'falling-text';
    text.textContent = fallingTexts[Math.floor(Math.random() * fallingTexts.length)];
    text.style.left = Math.random() * 100 + '%';
    text.style.animationDuration = (3 + Math.random() * 4) + 's';
    text.style.fontSize = (12 + Math.random() * 12) + 'px';
    fallingContainer.appendChild(text);
    setTimeout(() => text.remove(), 8000);
  }, 300);
}
