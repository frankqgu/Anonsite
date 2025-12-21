import { supabase } from './supabase.js';

export async function renderRandom() {
  await renderBoard('random', 'hey guys keep memes out of #general');
}

export async function renderMedia() {
  await renderBoard('media', 'A board for sharing images and videos', true, 10);
}

export async function renderContacts() {
  await renderBoard('contacts', 'Drop ur handle and an intro if u want', true, 10, false);
}

async function renderBoard(boardName, description, allowMedia = false, maxFileSizeMB = 0, requiresReview = false) {
  const app = document.getElementById('app');
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

  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePostSubmit(boardName, requiresReview, allowMedia, maxFileSizeMB);
  });

  await fetchPosts(boardName);
}

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
      postEl.innerHTML = `
        <div class="post-header">
          <strong>${post.username || 'Anonymous'}</strong>
          <span class="post-time">
            ${new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <div class="post-content">${post.content}</div>
      `;
      postsContainer.appendChild(postEl);
    }
  } catch (err) {
    console.error('Error loading posts:', err);
    postsContainer.innerHTML = `<p style="color:red;">Failed to load posts</p>`;
  }
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

    await fetchPosts(boardName);
  } catch (error) {
    console.error('Error posting:', error);
    alert(`Error posting: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = requiresReview ? 'Submit for Review' : 'Post Comment';
  }
}
