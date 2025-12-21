import { renderHome } from './home.js';
import { renderRandom, renderMedia, renderContacts } from './boards.js';
import { renderMe } from './me.js';

const routes = {
    '': renderHome,
    'random': renderRandom,
    'media': renderMedia,
    'contacts': renderContacts,
    'me': renderMe
};

export function navigate(path) {
    window.location.hash = path;
}

export function router() {
    const hash = window.location.hash.slice(1) || '';
    const render = routes[hash] || renderHome;

    const ascii = document.getElementById('ascii-bg');
    if (ascii) ascii.style.display = (hash === 'me') ? 'block' : 'none';

    render();
}
