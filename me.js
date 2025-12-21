export function renderMe() {
  const app = document.getElementById('app');

  let ascii = document.getElementById('ascii-bg');
  if (!ascii) {
    ascii = document.createElement('pre');
    ascii.id = 'ascii-bg';
    document.body.appendChild(ascii);
  }
  ascii.style.display = 'block';

  app.innerHTML = `
    <div class="me-content-box">
      <a href="#" data-link class="back-link">← back to home</a>
      <h1>#me</h1>
      <h2>Hi</h2>
      <p>@qindgaf</p>
      <br>
      <h3>quinn/qing</h3>
      <ul style="margin-left: 20px; line-height: 2;">
        <li>21</li>
        <li>cn</li>
        <li>they/wtv</li>
        <li>i</li>
        <li>d</li>
        <li>k</li>
      </ul>
    </div>
  `;

  initHearts();
}

// ------------------------
// Hearts animation only
// ------------------------
const canvas = document.getElementById('heart-canvas');
const ctx = canvas?.getContext('2d');
let width, height;
let hearts = [];
const heartCount = 80;
const repelRadius = 100;
let animationRunning = false;
let mouse = { x: null, y: null };

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

class Heart {
  constructor() { this.reset(); }
  reset() { this.x = Math.random() * width; this.y = Math.random() * height; this.size = 14 + Math.random() * 10; this.baseX = this.x; this.baseY = this.y; }
  draw() { if (!ctx) return; ctx.font = `${this.size}px serif`; ctx.fillStyle = 'rgba(255,160,180,0.8)'; ctx.fillText('♡', this.x, this.y); }
  update() {
    if (mouse.x === null || mouse.y === null) { this.x += (this.baseX - this.x) * 0.02; this.y += (this.baseY - this.y) * 0.02; return; }
    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < repelRadius) {
      const force = (repelRadius - dist) / repelRadius;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * force * 10;
      this.y += Math.sin(angle) * force * 10;
    } else {
      this.x += (this.baseX - this.x) * 0.02;
      this.y += (this.baseY - this.y) * 0.02;
    }
  }
}

function initHearts() {
  if (!canvas || !ctx) return;
  hearts = [];
  for (let i = 0; i < heartCount; i++) hearts.push(new Heart());
  animateHearts();
}

function animateHearts() {
  if (!canvas || !ctx || animationRunning) return;
  animationRunning = true;
  (function loop() {
    const meBg = document.getElementById('me-bg');
    if (!meBg?.classList.contains('active')) { animationRunning = false; return; }
    ctx.clearRect(0, 0, width, height);
    for (const h of hearts) { h.update(); h.draw(); }
    requestAnimationFrame(loop);
  })();
}

export function checkHash() {
  const meBg = document.getElementById('me-bg');
  if (!meBg) return;
  if (window.location.hash === '#me') {
    meBg.classList.add('active');
    initHearts();
  } else {
    meBg.classList.remove('active');
  }
}
