class MantraBubbles extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mantras = [];
        this.bubbles = [];
        this.container = null;
        this.animationInterval = null;
        this.activeBubbleIndex = -1; // -1 means no bubble is active initially
        this.animationDuration = 8000; // Total cycle duration for one mantra
        this.transitionDuration = 1500; // Duration for enter/exit animations
        this.transitionOverlap = 500; // How much enter and exit animations overlap
        this.colors = [
            'rgba(0, 120, 215, 0.3)', // Windows Blue
            'rgba(13, 128, 128, 0.3)', // Teal
            'rgba(136, 23, 152, 0.3)', // Purple
            'rgba(0, 153, 188, 0.3)', // Cyan
            'rgba(231, 72, 86, 0.3)', // Red
        ];
    }

    async connectedCallback() {
        this.setupDOM();
        await this.loadMantras();
        if (this.mantras.length > 0) {
            requestAnimationFrame(() => this.startAnimationLoop());
        }
    }

    disconnectedCallback() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    setupDOM() {
        const style = document.createElement('style');
        style.textContent = `
            .mantra-container {
                position: relative;
                width: 100%;
                min-height: 400px;
                height: 60vh;
                overflow: hidden;
                border-radius: 8px;
                margin-top: 2rem;
                margin-bottom: 2rem;
            }
            .mantra-bubble {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 30px;
                color: #ffffff;
                font-family: 'Segoe UI', 'Noto Sans', sans-serif;
                font-size: clamp(1em, 3vw, 1.4em);
                line-height: 1.5;
                font-weight: 400;
                border-radius: 50%;
                backdrop-filter: blur(20px) saturate(120%);
                -webkit-backdrop-filter: blur(20px) saturate(120%);
                border: 1px solid rgba(255, 255, 255, 0.18);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
                opacity: 0;
                transform: scale(0.5);
                will-change: transform, opacity;
                pointer-events: none;
                transition: background-color 0.5s ease;
            }
            @keyframes mantra-enter {
                0% { transform: scale(0.5) translateY(20px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes mantra-exit {
                0% { opacity: 1; transform: scale(1) translateY(0); }
                100% { transform: scale(0.8) translateY(30px); opacity: 0; }
            }
            @keyframes mantra-idle-float {
                0% { transform: translateY(0px) rotate(-2deg); }
                50% { transform: translateY(-15px) rotate(2deg) scale(1.02); }
                100% { transform: translateY(0px) rotate(-2deg); }
            }
        `;

        this.container = document.createElement('div');
        this.container.classList.add('mantra-container');

        for (let i = 0; i < 2; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('mantra-bubble');
            this.container.appendChild(bubble);
            this.bubbles.push(bubble);
        }

        this.shadowRoot.append(style, this.container);
    }

    async loadMantras() {
        const src = this.getAttribute('src');
        if (!src) {
            console.error('MantraBubbles: src attribute is required.');
            return;
        }
        try {
            const response = await fetch(new URL(src, import.meta.url).href);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.mantras = await response.json(); // Correctly parse the JSON body.
        } catch (error) {
            console.error('Error loading mantras:', error);
            const container = this.shadowRoot.querySelector('.mantra-container');
            if (container) {
                container.textContent = 'Could not load mantras.';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                container.style.color = '#eff0f1';
            }
        }
    }

    getRandomMantra(exclude = []) {
        if (this.mantras.length === 0) return '';
        let availableMantras = this.mantras.filter(m => !exclude.includes(m));
        if (availableMantras.length === 0) {
            availableMantras = this.mantras;
        }
        const randomIndex = Math.floor(Math.random() * availableMantras.length);
        return availableMantras[randomIndex];
    }

    setupAndAnimateBubble(bubble, mantra) {
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.textContent = mantra;
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        const baseSize = Math.min(containerWidth, containerHeight);
        const size = Math.random() * (baseSize * 0.2) + (baseSize * 0.5); // Bubble size between 50% and 70% of the smaller container dimension
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Calculate max top/left to keep bubble fully within container
        const maxTop = Math.max(0, containerHeight - size - 20);
        const maxLeft = Math.max(0, containerWidth - size - 20);

        const top = Math.random() * maxTop + 10;
        const left = Math.random() * maxLeft + 10;

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        bubble.style.backgroundColor = randomColor;
        bubble.style.animation = `mantra-enter ${this.transitionDuration / 1000}s forwards, mantra-idle-float 8s ease-in-out 1s infinite alternate`;
        bubble.style.pointerEvents = 'auto';
    }

    showNewMantras() {
        if (this.mantras.length === 0) return;
        const prevBubble = this.activeBubbleIndex !== -1 ? this.bubbles[this.activeBubbleIndex] : null;
        this.activeBubbleIndex = (this.activeBubbleIndex + 1) % 2;
        const currentBubble = this.bubbles[this.activeBubbleIndex];
        const newMantra = this.getRandomMantra(prevBubble ? [prevBubble.textContent] : []);
        if (prevBubble) {
            prevBubble.style.animation = `mantra-exit ${this.transitionDuration / 1000}s forwards`;
            prevBubble.style.pointerEvents = 'none';
        }
        setTimeout(() => {
            this.setupAndAnimateBubble(currentBubble, newMantra);
        }, prevBubble ? (this.transitionDuration - this.transitionOverlap) : 0); // Start new bubble animation after old one has started fading
    }

    startAnimationLoop() {
        this.showNewMantras();
        this.animationInterval = setInterval(() => this.showNewMantras(), this.animationDuration);
    }
}

customElements.define('mantra-bubbles', MantraBubbles);
