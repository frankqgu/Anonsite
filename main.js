import { supabase } from './supabase.js';

const app = document.getElementById('app');

const cursorTexts = ['✧', '★', '♡', '☆', '✦', '◇', '○', '●', '△', '▽', 'uwu', 'hi', '(◕‿◕)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '♪', '♫'];
const fallingTexts = ['✧', '★', '♡', '☆', '✦', '◇', '○', '●', '△', '▽', '♪', '♫', '~', '•', '◆', '◈'];

let lastCursorTime = 0;
document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastCursorTime > 100) {
    createCursorText(e.pageX, e.pageY);
    lastCursorTime = now;
  }
});

function createCursorText(x, y) {
  const text = document.createElement('div');
  text.className = 'cursor-text';
  text.textContent = cursorTexts[Math.floor(Math.random() * cursorTexts.length)];
  text.style.left = x + 'px';
  text.style.top = y + 'px';
  document.body.appendChild(text);
  setTimeout(() => text.remove(), 1000);
}

function createFallingText() {
  const hash = window.location.hash.slice(1) || '';
  if (hash === 'me') return; // no particles on #me

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
}

setInterval(createFallingText, 300);

const routes = {
  '': renderHome,
  'random': renderRandom,
  'media': renderMedia,
  'contacts': renderContacts,
  'me': renderMe
};

function navigate(path) {
  window.location.hash = path;
}

function router() {
  const hash = window.location.hash.slice(1) || '';
  const render = routes[hash] || renderHome;

  // Hide ASCII background except on #me
  const ascii = document.getElementById('ascii-bg');
  if (ascii) ascii.style.display = (hash === 'me') ? 'block' : 'none';

  render();
}

window.addEventListener('hashchange', router);

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    navigate(e.target.getAttribute('href'));
  }
});

function renderHome() {
  app.innerHTML = `
    <div class="marquee">
      <div class="marquee-content">
       ✩₊˚.⋆☾⋆⁺₊✧ WELCOME TO MY VOICEMAIL PLEASE LEAVE A MESSAGE 谢谢 ( • ᴗ - ) ✧
      </div>
    </div>
    <div class="container">
      <h1>quinn.me</h1>
      <nav class="nav">
        <ul>
          <li><a href="#random" data-link>#random</a> - #general</li>
          <li><a href="#media" data-link>#media</a> - imgs and vids</li>
          <li><a href="#contacts" data-link>#contacts</a> - if u want oomfs</li>
          <li><a href="#me" data-link>#me</a> - stalk me</li>
        </ul>
      </nav>
    </div>
  `;
}

async function renderRandom() { renderBoard('random', 'hey guys keep memes out of #general'); }
async function renderMedia() { renderBoard('media', 'A board for sharing images and videos', true, 10); }
async function renderContacts() { renderBoard('contacts', 'Drop ur handle and an intro if u want', true, 10, false); }

async function renderBoard(boardName, description, allowMedia = false, maxFileSizeMB = 0, requiresReview = false) {
  app.innerHTML = `
    <div class="container">
      <a href="#" data-link class="back-link">← back to home</a>
      <h1>#${boardName}</h1>
      <p class="board-description">${description}</p>
      <form id="post-form">
        <div class="form-group"><label for="username">Username (optional)</label><input type="text" id="username" placeholder="Anonymous"></div>
        <div class="form-group"><label for="content">Message</label><textarea id="content" required placeholder="Type your comment here..."></textarea></div>
        ${boardName === 'contacts' ? `
          <div class="form-group"><label for="social-label">Label</label><input type="text" id="social-label"></div>
          <div class="form-group"><label for="social-link">Link</label><input type="url" id="social-link"></div>
        ` : ''}
        ${allowMedia ? `
          <div class="form-group"><label for="media">Upload Media</label><input type="file" id="media" accept="image/*,video/*"></div>
        ` : ''}
        <button type="submit">${requiresReview ? 'Submit for Review' : 'Post Comment'}</button>
      </form>
      <div id="posts" class="posts"><div class="loading">Loading posts...</div></div>
    </div>
  `;

  const form = document.getElementById('post-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB);
  });
}

async function handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB) {
  const username = document.getElementById('username').value.trim() || 'Anonymous';
  const content = document.getElementById('content').value.trim();
  if (!content) return;

  const button = document.querySelector('#post-form button');
  button.disabled = true;
  button.textContent = 'Posting...';

  try {
    const { error } = await supabase
      .from('posts')
      .insert([{ board: boardName, username, content, status: requiresReview ? 'pending' : 'approved' }]);
    if (error) throw error;
    router();
  } catch (error) {
    console.error('Error posting:', error);
    alert(`Error posting: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = requiresReview ? 'Submit for Review' : 'Post Comment';
  }
}

// =====================
// #ME Page with ASCII BG
// =====================
function renderMe() {
  // Create ASCII background once if missing
  let ascii = document.getElementById('ascii-bg');
  if (!ascii) {
    ascii = document.createElement('pre');
    ascii.id = 'ascii-bg';
    document.body.appendChild(ascii);
  }
  ascii.style.display = 'block';

  // Foreground content
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

  startAsciiWallpaper();
}

let asciiFrame = 0;
let asciiInterval = null;

function startAsciiWallpaper() {
  const ascii = document.getElementById('ascii-bg');
  if (!ascii) return;

  const cloudArt = [
    "                  __      __   __        __      __   __      ",
    "             _(  )_( )__ (  )_(  )__  _(  )_( )_(  )_(  )_     ",
    "           (_   _    _  )(_   _    _)(_   _    _   _    _)    ",
    "          / /(_) (__)    / /(_) (__)/ /(_) (__)/ /(_) (__ )   ",
    "         / / / / / /    / / / / / // / / / / // / / / / /     ",
    "        / / / / / /    / / / / / // / / / / // / / / / /      ",
    "       /_/ /_/ /_/    /_/ /_/ /_//_/ /_/ /_//_/ /_/ /_/       "
  ];

  const cloudRows = cloudArt.length;
  const totalRows = 40;
  const cols = 120;

  function makeHugeCloud() {
    const art = [];
    while (art.length < Math.floor(totalRows / 2)) art.push(...cloudArt);
    return art.slice(0, Math.floor(totalRows / 2));
  }

  function makeRainFrame() {
    const rows = [];
    for (let r = 0; r < totalRows - cloudRows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        const baseChance = 0.03 + 0.02 * Math.sin((asciiFrame / 10) + r / 5);
        line += Math.random() < baseChance
          ? (Math.random() < 0.5 ? '│' : '┃')
          : ' ';
      }
      rows.push(line);
    }
    return rows;
  }

  function renderFrame() {
    asciiFrame++;
    const cloud = makeHugeCloud();
    const rain = makeRainFrame();
    ascii.textContent = [...cloud, ...rain].join('\n');
  }

  clearInterval(asciiInterval);
  asciiInterval = setInterval(renderFrame, 1000);
  renderFrame();
}

router();
