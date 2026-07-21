class AnimatedAvatar extends HTMLElement {

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Init the default data in the component
    this.images = {};
    this.allImagesLoaded = false;
    this.isBlinking = false;
    this.blinkFrame = 0;
    this.breathScale = 1;
    this.breathDirection = 0.0001;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = globalThis.innerWidth < 800 ? 200 : 400;
    this.canvas.height = globalThis.innerHeight < 600 ? 250 : 500;
    this.shadowRoot.appendChild(this.canvas);

    this.imagePaths = {
      base: this.getAttribute('image-base'),
      open: this.getAttribute('image-open'),
      half: this.getAttribute('image-half'),
      closed: this.getAttribute('image-closed')
    };
  }

  // Load data to the shadowDom
  connectedCallback() {
    this.loadImages().then(() => {
      this.allImagesLoaded = true;
      this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
      this.blinkInterval = setInterval(() => {
        if (!this.isBlinking) this.animateBlink();
      }, Math.random() * 3000 + 2000);
    }).catch(error => {
      console.error('Error loading images, stopping animation:', error);
    });
  }

  // Do not trash. -> Avoid memory leak
  disconnectedCallback() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    console.log('<animated-avatar> animation stopped.');
  }

  loadImages() {
    let loadedCount = 0;
    const totalImages = Object.keys(this.imagePaths).length;

    return new Promise((resolve, reject) => {
      for (const key in this.imagePaths) {
        const path = this.imagePaths[key];
        if (!path) {
          return reject(new Error(`Missing image url for ${key}.`));
        }

        this.images[key] = new Image();
        this.images[key].src = path;
        this.images[key].onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        this.images[key].onerror = () => {
          reject(new Error(`Error loading image: ${path}`));
        };
      }
    })
  }

  // Breathing animation
  updateBreath() {
    if (this.breathScale + this.breathDirection > 1.005 || this.breathScale + this.breathDirection < 0.995) {
      this.breathDirection *= -1;
    }
    this.breathScale += this.breathDirection;
  }

  // Blinking animation
  animateBlink() {
    this.isBlinking = true;
    const BLINK_SPEED = 50;

    setTimeout(() => { this.blinkFrame = 1; this.draw(); }, BLINK_SPEED);
    setTimeout(() => { this.blinkFrame = 2; this.draw(); }, BLINK_SPEED * 2);
    setTimeout(() => { this.blinkFrame = 1; this.draw(); }, BLINK_SPEED * 3);
    setTimeout(() => {
      this.blinkFrame = 0;
      this.isBlinking = false;
      this.draw();
    }, BLINK_SPEED * 4);
  }

  draw() {
    if (!this.allImagesLoaded) return;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.ctx.clearRect(0, 0, W, H);

    this.ctx.save();

    const anchorY = H * 0.9;
    this.ctx.translate(W / 2, anchorY);
    this.ctx.scale(1, this.breathScale);
    this.ctx.translate(-W / 2, -anchorY);

    this.ctx.drawImage(this.images.base, 0, 0, W, H);

    let currentEyeImage;
    if (this.blinkFrame === 0) currentEyeImage = this.images.open;
    else if (this.blinkFrame === 1) currentEyeImage = this.images.half;
    else currentEyeImage = this.images.closed;

    this.ctx.drawImage(currentEyeImage, 0, 0, W, H);

    this.ctx.restore();
  }

  gameLoop() {
    this.updateBreath();
    this.draw();
    this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
  }

}

export default AnimatedAvatar;