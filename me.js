import { initMeEditor, makeMeItem } from "./me-editor.js";

export function renderMe() {
  const app = document.getElementById("app");

  // keep your ascii-bg behavior if you still want it (optional)
  let ascii = document.getElementById("ascii-bg");
  if (!ascii) {
    ascii = document.createElement("pre");
    ascii.id = "ascii-bg";
    document.body.appendChild(ascii);
  }
  ascii.style.display = "block";

  // FULL PAGE editor canvas + text overlay
  app.innerHTML = `
    <div class="me-stage" id="me-stage">
      <div class="me-canvas" id="me-editor"></div>

      <div class="me-overlay">
        <a href="#" data-link class="back-link">← back to home</a>
        <h1>#me</h1>
        <h2>Hi</h2>
        <p>@xiexiejiemei</p>
        <br>
        <h3>quinn/qing</h3>
        <ul style="margin-left: 20px; line-height: 2;">
          <li>21</li>
          <li>cn/eng</li>
          <li>any</li>
          <li>games:league valorant overwatch cs2 nightreign ff7 p5 expedition33, re9
          currently metaphor</li>
          <li>likes:lpl(blg tes), firefly, GSWarriors, aespa, stein gate, Kino Tabi, FATE nasuverse, angel beats </li>
          <li>e 7/25/25</li>
        </ul>

        <p style="margin-top:10px; color:#777; font-size:14px;">
          1/5/26</b>
        </p>
      </div>
    </div>
  `;

  const editor = document.getElementById("me-editor");
  if (editor) {
    initMeEditor(editor);

    // Add your images (put them in /public/imgs/)
    editor.appendChild(makeMeItem("/imgs/aerith.jpg", 1500, 350, 100, 250));
    editor.appendChild(makeMeItem("/imgs/kda.jpg", 150, 100, 300, 250));
    editor.appendChild(makeMeItem("/imgs/akiangel.jpg", 50, 660, 250, 300));
    editor.appendChild(makeMeItem("/imgs/lasttour.jpg", 1500, 100, 250, 150));
    editor.appendChild(makeMeItem("/imgs/lucario.jpg", 300, 420, 250, 250));
    editor.appendChild(makeMeItem("/imgs/sinon.jpg", 700, 720, 250, 250));
    editor.appendChild(makeMeItem("/imgs/ganyu.jpg", 1400, 620, 300, 300));
    editor.appendChild(makeMeItem("/imgs/kinos.jpg", 1000, 640, 300, 300));
    editor.appendChild(makeMeItem("/imgs/frank.jpg", 400, 740, 200, 300));
    editor.appendChild(makeMeItem("/imgs/yunara.jpg", 1800, 820, 200, 200));
  }
}

export function checkHash() {
  // just show/hide ascii bg on route
  const ascii = document.getElementById("ascii-bg");
  if (!ascii) return;
  ascii.style.display = window.location.hash === "#me" ? "block" : "none";
}
