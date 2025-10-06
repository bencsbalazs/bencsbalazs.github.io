class MantraBubbles extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = null;
        this.bubbles = [];
        this.container = null;
        this.animationInterval = null;
        this.activeBubbleIndex = -1;
        this.selectedLanguage = 'en';
        this.selectedCategory = 'general';
        this.animationDuration = 8000;
        this.transitionDuration = 1500;
        this.transitionOverlap = 500;
        this.colors = [
            'rgba(0, 120, 215, 0.3)',
            'rgba(13, 128, 128, 0.3)',
            'rgba(136, 23, 152, 0.3)',
            'rgba(0, 153, 188, 0.3)',
            'rgba(231, 72, 86, 0.3)',
        ];
    }

    async connectedCallback() {
        this.setupDOM();
        this.fullScreen();
        await this.loadMantras();
        if (this.data) {
            this.populateSelectors();
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
            :host {
                display: block;
                position: relative;
            }
            .controls {
                position: absolute;
                top: 1rem;
                right: 1rem;
                z-index: 10;
                display: flex;
                gap: 1rem;
            }
            .controls select {
                padding: 0.5rem;
                border-radius: 4px;
                border: 1px solid #ccc;
                background-color: #fff;
            }
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
                font-size: clamp(0.9em, 2.5vw, 1.3em);
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
                box-sizing: border-box;
                overflow-wrap: break-word;
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

        const controls = document.createElement('div');
        controls.classList.add('controls');

        const langSelector = document.createElement('select');
        langSelector.id = 'lang-selector';
        langSelector.innerHTML = `
            <option value="en">English</option>
            <option value="hu">Hungarian</option>
        `;
        langSelector.addEventListener('change', (e) => {
            this.selectedLanguage = e.target.value;
            this.restartAnimation();
        });

        const categorySelector = document.createElement('select');
        categorySelector.id = 'category-selector';
        categorySelector.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.restartAnimation();
        });

        const fullScreenButton = document.createElement('button');
        fullScreenButton.id = 'fullscreen-button';
        fullScreenButton.textContent = 'Toggle Fullscreen';

        controls.append(langSelector, categorySelector, fullScreenButton);

        this.container = document.createElement('div');
        this.container.classList.add('mantra-container', 'fullscreen-container');

        for (let i = 0; i < 2; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('mantra-bubble');
            this.container.appendChild(bubble);
            this.bubbles.push(bubble);
        }

        this.shadowRoot.append(style, controls, this.container);
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
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading mantras:', error);
            if (this.container) {
                this.container.textContent = 'Could not load mantras.';
                this.container.style.display = 'flex';
                this.container.style.alignItems = 'center';
                this.container.style.justifyContent = 'center';
                this.container.style.color = '#eff0f1';
            }
        }
    }

    populateSelectors() {
        const categorySelector = this.shadowRoot.getElementById('category-selector');
        if (!categorySelector || !this.data || !this.data.categories) return;

        for (const key in this.data.categories) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = this.data.categories[key][this.selectedLanguage];
            categorySelector.appendChild(option);
        }
    }

    getRandomMantra(exclude = []) {
        if (!this.data || !this.data.mantras) return '';

        const mantras = this.data.mantras[this.selectedCategory] || [];
        if (mantras.length === 0) return '';

        let availableMantras = mantras.filter(m => !exclude.includes(m[this.selectedLanguage]));
        if (availableMantras.length === 0) {
            availableMantras = mantras;
        }
        const randomIndex = Math.floor(Math.random() * availableMantras.length);
        return availableMantras[randomIndex][this.selectedLanguage];
    }

    setupAndAnimateBubble(bubble, mantra) {
        bubble.style.animation = 'none';
        bubble.offsetWidth; // Trigger reflow
        bubble.textContent = mantra;

        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        const margin = 30;
        const effectiveHeight = containerHeight - margin * 2;
        const effectiveWidth = containerWidth - margin * 2;
        const baseSize = Math.min(effectiveWidth, effectiveHeight);
        const estimatedFontSize = 20;
        const minSize = Math.sqrt(mantra.length) * estimatedFontSize;
        const randomSize = Math.random() * (baseSize * 0.3) + (baseSize * 0.5);
        let size = Math.max(minSize, randomSize);
        size = Math.min(size, baseSize);

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        const maxTop = effectiveHeight - size;
        const maxLeft = effectiveWidth - size;

        const top = Math.random() * maxTop + margin;
        const left = Math.random() * maxLeft + margin;

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        bubble.style.backgroundColor = randomColor;
        bubble.style.animation = `mantra-enter ${this.transitionDuration / 1000}s forwards, mantra-idle-float 8s ease-in-out 1s infinite alternate`;
        bubble.style.pointerEvents = 'auto';
    }

    showNewMantras() {
        if (!this.data) return;
        const prevBubble = this.activeBubbleIndex !== -1 ? this.bubbles[this.activeBubbleIndex] : null;
        this.activeBubbleIndex = (this.activeBubbleIndex + 1) % 2;
        const currentBubble = this.bubbles[this.activeBubbleIndex];
        const newMantra = this.getRandomMantra(prevBubble ? [prevBubble.textContent] : []);

        if (!newMantra) {
            currentBubble.style.opacity = 0;
            return;
        }

        if (prevBubble) {
            prevBubble.style.animation = `mantra-exit ${this.transitionDuration / 1000}s forwards`;
            prevBubble.style.pointerEvents = 'none';
        }
        setTimeout(() => {
            this.setupAndAnimateBubble(currentBubble, newMantra);
        }, prevBubble ? (this.transitionDuration - this.transitionOverlap) : 0);
    }

    startAnimationLoop() {
        this.showNewMantras();
        this.animationInterval = setInterval(() => this.showNewMantras(), this.animationDuration);
    }

    restartAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        this.bubbles.forEach(b => b.style.opacity = 0);
        const categorySelector = this.shadowRoot.getElementById('category-selector');
        if (categorySelector && this.data && this.data.categories) {
            for (const option of categorySelector.options) {
                option.textContent = this.data.categories[option.value][this.selectedLanguage];
            }
        }

        this.startAnimationLoop();
    }

    fullScreen() {
        document.addEventListener('DOMContentLoaded', () => {
            const container = this.shadowRoot.getElementById('fullscreen-container');

            this.shadowRoot.getElementById('fullscreen-button').addEventListener('click', () => {
                console.log("clicked")
                if (this.shadowRoot.fullscreenEnabled) {
                    if (!this.shadowRoot.fullscreenElement) {
                        container.requestFullscreen();
                    } else {
                        this.shadowRoot.exitFullscreen();
                    }
                } else {
                    console.log('A teljes képernyős mód nem támogatott a böngésződben.');
                }
            });

            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) {
                    console.log('Beléptél a teljes képernyős módba!');
                } else {
                    console.log('Kiléptél a teljes képernyős módból.');
                }
            });
        });
    }
}

customElements.define('mantra-bubbles', MantraBubbles);
