import { initCursor, initFallingText } from './effects.js';
import { router, navigate } from './router.js';
import { checkHash } from './me.js';

const app = document.getElementById('app');

// Initialize global effects
initCursor();
initFallingText();

// Initial route render
router();

// Listen for navigation
window.addEventListener('hashchange', router);
window.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    navigate(e.target.getAttribute('href'));
  }
});

// Hearts animation + #me page checks
window.addEventListener('hashchange', checkHash);
window.addEventListener('load', checkHash);
