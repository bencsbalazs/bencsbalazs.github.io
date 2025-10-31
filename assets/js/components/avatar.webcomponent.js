const avatarImageBase64 = "/assets/images/cartoonme.jpg";


class ParallaxAvatar extends HTMLElement {
    constructor() {
        super();
        // Shadow DOM létrehozása a teljes beágyazáshoz
        this.attachShadow({ mode: 'open' });

        // A 'this' kontextus "bidelése" az eseménykezelőkhöz
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    connectedCallback() {
        this.imageSrc = this.getAttribute('src');
        this.altText = this.getAttribute('alt') || 'Avatar';
        this.render();
        this.container = this.shadowRoot.querySelector('.avatar-container');
        this.card = this.shadowRoot.querySelector('.avatar-card');
        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('mouseleave', this.onMouseLeave);
        this.container.addEventListener('click', this.onClick);
    }

    disconnectedCallback() {
        // Eseményfigyelők eltávolítása a memória szivárgás elkerülése végett
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('mouseleave', this.onMouseLeave);
        this.container.removeEventListener('click', this.onClick);
    }

    render() {
        // A komponens stílusa és HTML struktúrája a Shadow DOM-on belül
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* A komponens kívülről látható mérete */
          display: block;
          width: 250px;
          height: 250px;
        }

        .avatar-container {
          /* A 3D perspektíva szülőeleme */
          width: 100%;
          height: 100%;
          perspective: 1000px; /* Ez adja a 3D-s mélységet */
          cursor: pointer;
        }

        .avatar-card {
          width: 100%;
          height: 100%;
          border-radius: 50%; /* Kerek avatar */
          background-color: #f0f0f0;
          overflow: hidden;
          
          /* A mozgás finomítása */
          transition: transform 0.1s ease-out, box-shadow 0.2s ease;
          transform-style: preserve-3d;
          
          /* Finom árnyék a "lebegés" érzetéhez */
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          
          /* GPU gyorsítás "kikényszerítése" */
          will-change: transform;
        }
        
        .avatar-card:hover {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          /* A kép "kiemelése" a kártya síkjából */
          transform: translateZ(30px) scale(1.05);
        }
      </style>
      
      <div class="avatar-container">
        <div class="avatar-card">
          <img src="${this.imageSrc}" alt="${this.altText}">
        </div>
      </div>
    `;
    }

    onMouseMove(e) {
        // Adatok lekérése a pozíció számításához
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left; // X pozíció a komponensen belül
        const y = e.clientY - rect.top;  // Y pozíció a komponensen belül

        const { width, height } = rect;
        const centerX = width / 2;
        const centerY = height / 2;

        // Értékek normalizálása (-1 és 1 között)
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        // A dőlés mértéke (pl. max 15 fok)
        const tiltX = deltaY * -15; // Y egérmozgás forgat X tengelyen
        const tiltY = deltaX * 15;  // X egérmozgás forgat Y tengelyen

        // Transzformáció alkalmazása
        this.card.style.transform = "rotateX(" + tiltX
            + "deg) rotateY(" + tiltY + "deg) scale(1.05)";
    }

    onMouseLeave() {
        // Alaphelyzetbe állítás, ha az egér elhagyja a komponenst
        this.card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }

    onClick() {
        console.log('Avatar clicked! Indulhat a Gemini API hívás...');

        // Egy "custom event" (egyéni esemény) küldése,
        // amire az oldalon kívül tudsz majd figyelni.
        // Ez a "best practice" a komponenseken belüli eseménykezelésre.
        this.dispatchEvent(new CustomEvent('avatar-click', {
            bubbles: true, // Az esemény "buborékolhat" felfelé a DOM-ban
            composed: true // Az esemény átléphet a Shadow DOM határon
        }));
    }
}

export default ParallaxAvatar;