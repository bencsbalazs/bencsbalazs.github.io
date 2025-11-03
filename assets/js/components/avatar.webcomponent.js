class AnimatedAvatar extends HTMLElement {

  // Figyelt attribútumok definiálása, ha a komponens reagálna a változásra.
  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Shadow DOM az izolációhoz

    // Állapotok
    this.images = {};
    this.allImagesLoaded = false;
    this.isBlinking = false;
    this.blinkFrame = 0;
    this.breathScale = 1;
    this.breathDirection = 0.0001;

    // Elem inicializálás
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Attribútumok beolvasása, ha nincsenek megadva, alapértelmezett értékek
    this.canvas.width = this.getAttribute('width') || 400;
    this.canvas.height = this.getAttribute('height') || 400;
    this.shadowRoot.appendChild(this.canvas);

    // Képcímek beolvasása az attribútumokból
    this.imagePaths = {
      base: this.getAttribute('image-base'),
      open: this.getAttribute('image-open'),
      half: this.getAttribute('image-half'),
      closed: this.getAttribute('image-closed')
    };
  }

  /**
   * connectedCallback: Erőforrások inicializálása és animációk indítása.
   * Ez a TDD szempontból is kritikus pont, itt indul az élet.
   */
  connectedCallback() {
    // TDD szempont: Csak akkor indítjuk az animációt, ha sikeresen csatlakozott a DOM-hoz.
    this.loadImages().then(() => {
      this.allImagesLoaded = true;
      // requestAnimationFrame indítása a folyamatos rajzoláshoz és légzéshez
      this.rafId = requestAnimationFrame(this.gameLoop.bind(this));

      // Interval indítása a véletlenszerű pislogáshoz
      this.blinkInterval = setInterval(() => {
        if (!this.isBlinking) this.animateBlink();
      }, Math.random() * 3000 + 2000);
    }).catch(error => {
      console.error('Hiba a képek betöltésekor, az animáció nem indul el:', error);
      // Itt megjeleníthetsz egy hibaüzenetet a Shadow DOM-ban.
    });
  }

  /**
   * disconnectedCallback: Erőforrások felszabadítása a memóriaszivárgás elkerülésére.
   * TDD szempont: Teszteli a "cleanup" mechanizmus helyes működését.
   */
  disconnectedCallback() {
    // requestAnimationFrame leállítása
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Interval leállítása
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    console.log('<animated-avatar> animációk leállítva.');
  }

  // === ADATKEZELÉS ÉS RAJZOLÁS LOGIKA ===

  /**
   * Képek aszinkron betöltése.
   */
  loadImages() {
    let loadedCount = 0;
    const totalImages = Object.keys(this.imagePaths).length;

    return new Promise((resolve, reject) => {
      for (const key in this.imagePaths) {
        const path = this.imagePaths[key];
        if (!path) {
          return reject(`Hiányzó kép elérési út a(z) ${key} attribútumban.`);
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
          reject(`Hiba a kép betöltésekor: ${path}`);
        };
      }
    });
  }

  /**
   * A légzés animáció állapotának frissítése (finom Y tengelyű skálázás).
   */
  updateBreath() {
    if (this.breathScale + this.breathDirection > 1.005 || this.breathScale + this.breathDirection < 0.995) {
      this.breathDirection *= -1; // Irányváltás
    }
    this.breathScale += this.breathDirection;
  }

  /**
   * A pislogás animáció logikája.
   */
  animateBlink() {
    this.isBlinking = true;
    const BLINK_SPEED = 50; // Képkocka idő

    // A pislogás fázisai (0:nyitott -> 1:félig -> 2:csukott -> 1:félig -> 0:nyitott)

    // Használjuk a setTimeout-ot a Canvas rajzolási idejének szimulálásához
    setTimeout(() => { this.blinkFrame = 1; this.draw(); }, BLINK_SPEED);
    setTimeout(() => { this.blinkFrame = 2; this.draw(); }, BLINK_SPEED * 2);
    setTimeout(() => { this.blinkFrame = 1; this.draw(); }, BLINK_SPEED * 3);
    setTimeout(() => {
      this.blinkFrame = 0;
      this.isBlinking = false;
      this.draw();
    }, BLINK_SPEED * 4);
  }

  /**
   * Az aktuális állapot kirajzolása a Canvas-ra.
   */
  draw() {
    if (!this.allImagesLoaded) return;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.ctx.clearRect(0, 0, W, H);

    // LÉGZÉS ANIMÁCIÓ (Skálázás)
    this.ctx.save();

    // A transzformáció origóját a test aljához állítjuk.
    const anchorY = H * 0.9;
    this.ctx.translate(W / 2, anchorY);
    this.ctx.scale(1, this.breathScale);
    this.ctx.translate(-W / 2, -anchorY);

    // 1. Rajzoljuk az alap testet (szemek nélkül)
    this.ctx.drawImage(this.images.base, 0, 0, W, H);

    // 2. Rajzoljuk rá a megfelelő szem állapotot
    let currentEyeImage;
    if (this.blinkFrame === 0) currentEyeImage = this.images.open;
    else if (this.blinkFrame === 1) currentEyeImage = this.images.half;
    else currentEyeImage = this.images.closed;

    this.ctx.drawImage(currentEyeImage, 0, 0, W, H);

    this.ctx.restore(); // Visszaállítjuk a transzformációt
  }

  /**
   * A fő animációs ciklus. requestAnimationFrame-t használ a hatékonyságért.
   */
  gameLoop() {
    this.updateBreath();
    this.draw();
    this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// Komponens regisztrálása
export default AnimatedAvatar;