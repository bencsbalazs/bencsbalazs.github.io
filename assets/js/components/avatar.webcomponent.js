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

    this.backendUrl = 'https://backend-gemini-1021576013555.europe-west1.run.app/'

    this.shadowRoot.innerHTML = `
    <style>
    #prompt-input {
      border-radius: .4rem;
      width: 70%;
      margin: .2rem;
      padding: .2rem;
      box-shadow: 0 0 .2rem;
      background: rgba(0, 0, 0, .2);
    }
    #send-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      translate: scale easing 1s;
    }
    #send-button:hover {
      cursor: pointer;
      transform: scale(1.1);
    }

    </style>
    <h5>I'm an AI agent to answer about Balázs Bencs and his works with the power of Gemini AI.</h5>
    <div id="container" style="display: none;"></div>
    `

    this.promptInput = document.createElement('input');
    this.promptInput.type = 'text';
    this.promptInput.setAttribute("id", "prompt-input")
    this.promptInput.setAttribute("placeholder", "Ask me anything...")

    this.sendButton = document.createElement('button');
    this.sendButton.setAttribute("id", "send-button");
    this.sendButton.setAttribute("type", "button");
    this.sendButton.classList.add('btn', 'btn-primary', 'btn-sm', 'rounded-pill');
    this.sendButton.textContent = 'Ask';

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.shadowRoot.getElementById('container').append(this.promptInput, this.sendButton);

    this.canvas.width = this.getAttribute('width') || 400;
    this.canvas.height = this.getAttribute('height') || 500;
    this.shadowRoot.appendChild(this.canvas);

    this.imagePaths = {
      base: this.getAttribute('image-base'),
      open: this.getAttribute('image-open'),
      half: this.getAttribute('image-half'),
      closed: this.getAttribute('image-closed')
    };

    this.sendButton.addEventListener('click', () => {
      const promptValue = this.promptInput.value.trim();

      if (promptValue.length === 0) {
        alert('Please enter a prompt!');
        return;
      }
      this.sendButton.disabled = true;

      console.log('Sending prompt:', promptValue);
      this.callGeminiApi(promptValue);
    });

    this.promptInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendButton.click();
      }
    })
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

  showResponse = (response) => {
    this.dispatchEvent(new CustomEvent('answare', {
      detail: {
        message: response
      },
      bubbles: true,
      composed: true
    }));
    console.log(response)
  }


  /**
   * Handles the communication with the Gemini AI.
   * @param {string} prompt The question of the user.
   */

  callGeminiApi = async (prompt) => {
    this.showResponse('Thinking to give an answer...');

    try {
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error during API call: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        this.showResponse(data.text);
      } else {
        this.showResponse('Error: Tha API returned unexpected data.');
      }

    } catch (error) {
      console.error('Error during API call:', error);
      this.showResponse(`Error during API call: ${error.message}. Check the CORS policy of the API.`);
    } finally {
      this.sendButton.disabled = false;
    }
  }
}

export default AnimatedAvatar;