import { supabase } from './supabase.js';

/* ================================
   BOARD ROUTES
================================ */

export async function renderRandom() {
  await renderBoard('random', 'hey guys keep memes out of #general');
}

export async function renderMedia() {
  await renderBoard('media', 'A board for sharing images and videos', true, 10);
}

export async function renderContacts() {
  await renderBoard(
    'contacts',
    'Drop ur handle and an intro if u want',
    true,
    10,
    false
  );
}

/* ================================
   MAIN BOARD RENDER
================================ */

async function renderBoard(
  boardName,
  description,
  allowMedia = false,
  maxFileSizeMB = 0,
  requiresReview = false
) {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="container">
      <a href="#" data-link class="back-link">← back to home</a>
      <h1>#${boardName}</h1>
      <p class="board-description">${description}</p>

      <form id="post-form">
        <div class="form-group">
          <label>Username (optional)</label>
          <input type="text" id="username" placeholder="Anonymous">
        </div>

        <div class="form-group">
          <label>Message</label>
          <textarea id="content" required placeholder="Type your comment here..."></textarea>
        </div>

        ${boardName === 'contacts'
      ? `
          <div class="form-group">
            <label>Label</label>
            <input type="text" id="social-label">
          </div>
          <div class="form-group">
            <label>Link</label>
            <input type="url" id="social-link">
          </div>
        `
      : ''
    }

        ${allowMedia
      ? `
          <div class="form-group">
            <label>Upload Media</label>
            <input type="file" id="media" accept="image/*,video/*">
          </div>
        `
      : ''
    }

        <button type="submit">
          ${requiresReview ? 'Submit for Review' : 'Post Comment'}
        </button>
      </form>

      <div id="posts" class="posts">
        <div class="loading">Loading posts...</div>
      </div>
    </div>
  `;

  document
    .getElementById('post-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      await handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB);
    });

  await fetchPosts(boardName);
}

/* ================================
   FETCH POSTS
================================ */

async function fetchPosts(boardName) {
  const postsContainer = document.getElementById('posts');

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('board', boardName)
      .order('created_at', { ascending: false });

    if (error) throw error;

    postsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      postsContainer.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    for (const post of data) {
      const postEl = document.createElement('div');
      postEl.className = 'post';

      let mediaHTML = '';

      if (post.media_url) {
        if (post.media_url.match(/\.(mp4|webm|ogg)$/i)) {
          mediaHTML = `
            <video controls class="post-media">
              <source src="${post.media_url}">
            </video>
          `;
        } else {
          mediaHTML = `
            <img src="${post.media_url}" class="post-media" loading="lazy">
          `;
        }
      }

      postEl.innerHTML = `
        <div class="post-header">
          <strong>${post.username || 'Anonymous'}</strong>
          <span>${new Date(post.created_at).toLocaleString()}</span>
        </div>

        <div class="post-content">${post.content}</div>
        ${mediaHTML}
      `;

      postsContainer.appendChild(postEl);
    }
  } catch (err) {
    console.error(err);
    postsContainer.innerHTML =
      '<p style="color:red;">Failed to load posts</p>';
  }
}

/* ================================
   HANDLE SUBMIT
================================ */

async function handlePostSubmit(
  boardName,
  requiresReview,
  allowMedia,
  maxFileSizeMB
) {
  const username =
    document.getElementById('username').value.trim() || 'Anonymous';
  const content = document.getElementById('content').value.trim();
  const fileInput = document.getElementById('media');
  const file = allowMedia && fileInput ? fileInput.files[0] : null;

  if (!content) return;

  const button = document.querySelector('#post-form button');
  button.disabled = true;
  button.textContent = 'Posting...';

  let media_url = null;

  try {
    if (file) {
      if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
        throw new Error(`File must be under ${maxFileSizeMB}MB`);
      }

      const ext = file.name.split('.').pop();
      const path = `${boardName}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(path);

      media_url = data.publicUrl;
    }

    const { error } = await supabase.from('posts').insert([
      {
        board: boardName,
        username,
        content,
        media_url,
        status: requiresReview ? 'pending' : 'approved'
      }
    ]);

    if (error) throw error;

    document.getElementById('post-form').reset();
    await fetchPosts(boardName);
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    button.disabled = false;
    button.textContent = requiresReview
      ? 'Submit for Review'
      : 'Post Comment';
  }
}
