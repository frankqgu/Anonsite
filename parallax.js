// Parallax scene configurations with text-based scenery
export const parallaxScenes = [
  {
    name: 'Rain',
    layers: [
      {
        type: 'rain',
        chars: ['/', '/', '/', '/'],
        density: 80,
        speed: 'back'
      },
      {
        type: 'rain',
        chars: ['/', '/', '/', '/'],
        density: 60,
        speed: 'mid'
      },
      {
        type: 'rain',
        chars: ['/', '/', '/', '/'],
        density: 40,
        speed: 'front'
      }
    ]
  },
  {
    name: 'Stars',
    layers: [
      {
        type: 'scatter',
        chars: ['✧', '★', '☆', '✦', '◇'],
        density: 50,
        speed: 'back'
      },
      {
        type: 'scatter',
        chars: ['✧', '★', '☆', '✦'],
        density: 40,
        speed: 'mid'
      },
      {
        type: 'scatter',
        chars: ['✧', '★', '☆'],
        density: 30,
        speed: 'front'
      }
    ]
  },
  {
    name: 'Forest',
    layers: [
      {
        type: 'scatter',
        chars: ['Y', 'T', '¥'],
        density: 30,
        speed: 'back'
      },
      {
        type: 'scatter',
        chars: ['♠', '♣', '▲', '△'],
        density: 40,
        speed: 'mid'
      },
      {
        type: 'scatter',
        chars: ['|', '¦', 'l'],
        density: 50,
        speed: 'front'
      }
    ]
  },
  {
    name: 'Waves',
    layers: [
      {
        type: 'wave',
        chars: ['~', '≈', '～'],
        density: 60,
        speed: 'back'
      },
      {
        type: 'wave',
        chars: ['~', '≈', '～'],
        density: 50,
        speed: 'mid'
      },
      {
        type: 'wave',
        chars: ['~', '≈', '～'],
        density: 40,
        speed: 'front'
      }
    ]
  },
  {
    name: 'Matrix',
    layers: [
      {
        type: 'matrix',
        chars: ['0', '1', '0', '1', '01', '10', '001', '101', '010', '110'],
        density: 60,
        speed: 'back'
      },
      {
        type: 'matrix',
        chars: ['0', '1', '01', '10'],
        density: 50,
        speed: 'mid'
      },
      {
        type: 'matrix',
        chars: ['0', '1'],
        density: 40,
        speed: 'front'
      }
    ]
  }
];

export class ParallaxManager {
  constructor() {
    this.currentScene = 0;
    this.scenes = [];
    this.isTransitioning = false;
    this.wrapper = null;
    this.navBar = null;
  }

  init() {
    this.createWrapper();
    this.createScenes();
    this.createNavBar();
    this.showScene(0);
    this.setupWheelListener();
  }

  createWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'parallax-wrapper';
    document.body.appendChild(this.wrapper);
  }

  createScenes() {
    parallaxScenes.forEach((sceneConfig, index) => {
      const scene = document.createElement('div');
      scene.className = 'parallax-scene';
      scene.dataset.index = index;

      sceneConfig.layers.forEach((layerConfig) => {
        const layer = this.createLayer(layerConfig);
        scene.appendChild(layer);
      });

      this.wrapper.appendChild(scene);
      this.scenes.push(scene);
    });
  }

  createLayer(config) {
    const layer = document.createElement('div');
    layer.className = `parallax-layer parallax-layer-${config.speed}`;

    const content = this.generateLayerContent(config);
    layer.textContent = content;

    return layer;
  }

  generateLayerContent(config) {
    const rows = 40;
    const cols = 100;
    let content = '';

    if (config.type === 'rain') {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() * 100 < config.density) {
            content += config.chars[Math.floor(Math.random() * config.chars.length)];
          } else {
            content += ' ';
          }
        }
        content += '\n';
      }
    } else if (config.type === 'scatter') {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() * 100 < config.density) {
            content += config.chars[Math.floor(Math.random() * config.chars.length)];
          } else {
            content += ' ';
          }
        }
        content += '\n';
      }
    } else if (config.type === 'wave') {
      for (let i = 0; i < rows; i++) {
        const offset = Math.sin(i * 0.3) * 5;
        for (let j = 0; j < cols; j++) {
          const wavePos = (j + offset) % 6;
          if (wavePos < 2 && Math.random() * 100 < config.density) {
            content += config.chars[Math.floor(Math.random() * config.chars.length)];
          } else {
            content += ' ';
          }
        }
        content += '\n';
      }
    } else if (config.type === 'matrix') {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() * 100 < config.density) {
            content += config.chars[Math.floor(Math.random() * config.chars.length)];
          } else {
            content += ' ';
          }
        }
        content += '\n';
      }
    }

    return content;
  }

  createNavBar() {
    this.navBar = document.createElement('div');
    this.navBar.className = 'parallax-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'parallax-arrow';
    prevBtn.textContent = '←';
    prevBtn.onclick = () => this.previousScene();

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'parallax-nav-dots';

    parallaxScenes.forEach((scene, index) => {
      const dot = document.createElement('div');
      dot.className = 'parallax-dot';
      dot.dataset.index = index;
      dot.onclick = () => this.goToScene(index);
      dotsContainer.appendChild(dot);
    });

    const info = document.createElement('div');
    info.className = 'parallax-info';
    info.textContent = `${this.currentScene + 1} / ${parallaxScenes.length}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'parallax-arrow';
    nextBtn.textContent = '→';
    nextBtn.onclick = () => this.nextScene();

    this.navBar.appendChild(prevBtn);
    this.navBar.appendChild(dotsContainer);
    this.navBar.appendChild(info);
    this.navBar.appendChild(nextBtn);

    document.body.appendChild(this.navBar);
    this.updateNavBar();
  }

  updateNavBar() {
    const dots = this.navBar.querySelectorAll('.parallax-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentScene);
    });

    const info = this.navBar.querySelector('.parallax-info');
    info.textContent = `${this.currentScene + 1} / ${parallaxScenes.length}`;

    const prevBtn = this.navBar.querySelector('.parallax-arrow:first-child');
    const nextBtn = this.navBar.querySelector('.parallax-arrow:last-child');

    prevBtn.disabled = this.currentScene === 0;
    nextBtn.disabled = this.currentScene === parallaxScenes.length - 1;
  }

  showScene(index) {
    if (index < 0 || index >= this.scenes.length || this.isTransitioning) return;

    this.scenes.forEach((scene, i) => {
      scene.classList.toggle('active', i === index);
    });

    this.currentScene = index;
    this.updateNavBar();
  }

  goToScene(index) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.showScene(index);
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }

  nextScene() {
    if (this.currentScene < parallaxScenes.length - 1) {
      this.goToScene(this.currentScene + 1);
    }
  }

  previousScene() {
    if (this.currentScene > 0) {
      this.goToScene(this.currentScene - 1);
    }
  }

  setupWheelListener() {
    let wheelTimeout = null;
    this.wrapper.addEventListener('wheel', (e) => {
      if (this.isTransitioning) return;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          this.nextScene();
        } else if (e.deltaY < 0) {
          this.previousScene();
        }
      }, 50);
    }, { passive: true });
  }

  destroy() {
    if (this.wrapper) {
      this.wrapper.remove();
    }
    if (this.navBar) {
      this.navBar.remove();
    }
    this.scenes = [];
    this.wrapper = null;
    this.navBar = null;
  }
}
