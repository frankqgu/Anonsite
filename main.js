import { supabase } from './supabase.js';

const app = document.getElementById('app');

const routes = {
  '': renderHome,
  'random': renderRandom,
  'media': renderMedia,
  'promotions': renderPromotions,
  'docs': renderDocs
};

function navigate(path) {
  window.location.hash = path;
}

function router() {
  const hash = window.location.hash.slice(1) || '';
  const render = routes[hash] || renderHome;
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
          <li><a href="#random" data-link>#random</a> - general purpose board</li>
          <li><a href="#media" data-link>#media</a> - images and videos</li>
          <li><a href="#promotions" data-link>#promotions</a> - promotional content</li>
          <li><a href="#docs" data-link>#docs</a> - documentation</li>
        </ul>
      </nav>
    </div>
  `;
}

async function renderRandom() {
  renderBoard('random', 'A general purpose board for discussions');
}

async function renderMedia() {
  renderBoard('media', 'A board for sharing images and videos', true, 10);
}

async function renderPromotions() {
  renderBoard('promotions', 'A curated board for sharing projects - posts are subject to review', true, 10, true);
}

async function renderBoard(boardName, description, allowMedia = false, maxFileSizeMB = 0, requiresReview = false) {
  app.innerHTML = `
    <div class="container">
      <a href="#" data-link class="back-link">← back to home</a>
      <h1>#${boardName}</h1>
      <p class="board-description">${description}</p>

      <form id="post-form">
        <div class="form-group">
          <label for="username">Username (optional)</label>
          <input type="text" id="username" placeholder="Anonymous">
        </div>
        <div class="form-group">
          <label for="content">Message</label>
          <textarea id="content" required placeholder="Your message..."></textarea>
        </div>
        ${allowMedia ? `
        <div class="form-group">
          <label for="media">Upload Media (Max ${maxFileSizeMB}MB)</label>
          <input type="file" id="media" accept="image/*,video/*">
        </div>
        ` : ''}
        <button type="submit">${requiresReview ? 'Submit for Review' : 'Post Comment'}</button>
      </form>

      <div class="sort-controls">
        <label for="sort">Sort:</label>
        <select id="sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <div class="checkbox-group">
          <input type="checkbox" id="show-tags" ${getShowTags() ? 'checked' : ''}>
          <label for="show-tags">Show user tags</label>
        </div>
      </div>

      <div id="posts" class="posts">
        <div class="loading">Loading posts...</div>
      </div>
    </div>
  `;

  const form = document.getElementById('post-form');
  const postsContainer = document.getElementById('posts');
  const sortSelect = document.getElementById('sort');
  const showTagsCheckbox = document.getElementById('show-tags');

  showTagsCheckbox.addEventListener('change', () => {
    setShowTags(showTagsCheckbox.checked);
    loadPosts();
  });

  sortSelect.addEventListener('change', loadPosts);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB);
  });

  async function loadPosts() {
    const sortOrder = sortSelect.value === 'newest' ? 'desc' : 'asc';

    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('board', boardName)
        .order('created_at', { ascending: sortOrder === 'asc' });

      const { data: posts, error } = await query;

      if (error) throw error;

      if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="empty-state">No posts yet. Be the first to post!</div>';
        return;
      }

      const showTags = getShowTags();
      postsContainer.innerHTML = posts.map(post => renderPost(post, showTags)).join('');
    } catch (error) {
      console.error('Error loading posts:', error);
      postsContainer.innerHTML = `<div class="error">Error loading posts: ${error.message}</div>`;
    }
  }

  loadPosts();
}

function renderPost(post, showTags) {
  const date = new Date(post.created_at).toLocaleString();
  const username = post.username || 'Anonymous';
  const statusBadge = post.status === 'pending' ? '<span class="post-status status-pending">PENDING REVIEW</span>' :
                      post.status === 'approved' ? '<span class="post-status status-approved">APPROVED</span>' : '';

  let mediaHtml = '';
  if (post.media_url) {
    const isVideo = post.media_url.match(/\.(mp4|webm|ogg)$/i);
    if (isVideo) {
      mediaHtml = `<video class="post-video" controls><source src="${post.media_url}" type="video/mp4"></video>`;
    } else {
      mediaHtml = `<img class="post-image" src="${post.media_url}" alt="Posted media">`;
    }
  }

  return `
    <div class="post">
      <div class="post-header">
        <span class="user-tag" ${!showTags ? 'style="display:none"' : ''}>${username}</span>
        <span class="post-time">${date}${statusBadge}</span>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${mediaHtml}
    </div>
  `;
}

async function handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB) {
  const username = document.getElementById('username').value.trim() || 'Anonymous';
  const content = document.getElementById('content').value.trim();
  const mediaInput = document.getElementById('media');

  if (!content) return;

  const button = document.querySelector('#post-form button');
  button.disabled = true;
  button.textContent = 'Posting...';

  try {
    let mediaUrl = null;

    if (allowMedia && mediaInput.files.length > 0) {
      const file = mediaInput.files[0];

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxFileSizeMB}MB`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${boardName}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      mediaUrl = publicUrl;
    }

    const postData = {
      board: boardName,
      username,
      content,
      media_url: mediaUrl,
      status: requiresReview ? 'pending' : 'approved'
    };

    const { error } = await supabase
      .from('posts')
      .insert([postData]);

    if (error) throw error;

    document.getElementById('username').value = '';
    document.getElementById('content').value = '';
    if (mediaInput) mediaInput.value = '';

    router();
  } catch (error) {
    console.error('Error posting:', error);
    alert(`Error posting: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = requiresReview ? 'Submit for Review' : 'Post Comment';
  }
}

function renderDocs() {
  app.innerHTML = `
    <div class="container">
      <a href="#" data-link class="back-link">← back to home</a>
      <h1>#docs</h1>
      <h2>API Documentation</h2>
      <p>This is an anonymous forum platform. No API is currently available.</p>
      <br>
      <h3>Features:</h3>
      <ul style="margin-left: 20px; line-height: 2;">
        <li>Anonymous posting without registration</li>
        <li>Multiple boards for different types of content</li>
        <li>Media upload support on #media and #promotions</li>
        <li>Moderation queue for #promotions board</li>
        <li>Real-time updates and sorting options</li>
      </ul>
    </div>
  `;
}

function getShowTags() {
  return localStorage.getItem('showUserTags') === 'true';
}

function setShowTags(value) {
  localStorage.setItem('showUserTags', value.toString());
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

router();
