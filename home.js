export function renderHome() {
    const app = document.getElementById('app');
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
  