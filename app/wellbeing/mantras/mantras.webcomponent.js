const DEFAULT_LANGUAGE = 'en';
const DEFAULT_CATEGORY = 'general';
const ANIMATION_DURATION = 8000;
const TRANSITION_DURATION = 1500;
const TRANSITION_OVERLAP = 500;
const BUBBLE_COLORS = [
    'rgba(0, 120, 215, 0.3)',
    'rgba(13, 128, 128, 0.3)',
    'rgba(136, 23, 152, 0.3)',
    'rgba(0, 153, 188, 0.3)',
    'rgba(231, 72, 86, 0.3)',
];

class MantraBubbles extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.data = null;
        this.bubbles = [];
        this.container = null;
        this.animationInterval = null;
        this.activeBubbleIndex = -1;
        this.selectedLanguage = DEFAULT_LANGUAGE;
        this.selectedCategory = DEFAULT_CATEGORY;
        this.animationDuration = ANIMATION_DURATION;
        this.transitionDuration = TRANSITION_DURATION;
        this.transitionOverlap = TRANSITION_OVERLAP;
        this.colors = BUBBLE_COLORS;
    }

    async connectedCallback() {
        this.setupDOM();
        this.addEventListeners();
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

    createDOM() {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = './mantras.css';

        const controls = document.createElement('div');
        controls.classList.add('controls');

        const langSelector = document.createElement('select');
        langSelector.id = 'lang-selector';
        langSelector.innerHTML = `
            <option value="en">English</option>
            <option value="hu">Hungarian</option>
        `;

        const categorySelector = document.createElement('select');
        categorySelector.id = 'category-selector';

        const autoplay = document.createElement('input');
        autoplay.type = 'checkbox';
        autoplay.id = 'autoplay';
        autoplay.checked = true;
        autoplay.classList.add('form-input');

        const fullScreenButton = document.createElement('button');
        fullScreenButton.id = 'fullscreen-button';
        fullScreenButton.textContent = 'Toggle Fullscreen';

        controls.append(langSelector, categorySelector, fullScreenButton, autoplay);

        this.container = document.createElement('div');
        this.container.classList.add('mantra-container');

        for (let i = 0; i < 2; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('mantra-bubble');
            this.container.appendChild(bubble);
            this.bubbles.push(bubble);
        }

        this.shadowRoot.append(style, controls, this.container);
    }

    setupDOM() {
        this.createDOM();
        this.toggleManualChange();
    }

    addEventListeners() {
        this.shadowRoot.getElementById('lang-selector').addEventListener('change', (e) => {
            this.selectedLanguage = e.target.value;
            this.restartAnimation();
        });

        this.shadowRoot.getElementById('category-selector').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.restartAnimation();
        });

        this.shadowRoot.getElementById('autoplay').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.startAnimationLoop();
            } else {
                clearInterval(this.animationInterval);
            }
            this.toggleManualChange();
        });

        this.shadowRoot.getElementById('fullscreen-button').addEventListener('click', () => {
            document.querySelector('#mantras').classList.toggle('fullscreen');
        });
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
                Object.assign(this.container.style, {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#eff0f1',
                });
            }
        }
    }

    toggleManualChange() {
        const controls = this.shadowRoot.querySelector('.controls');
        const autoplay = this.shadowRoot.getElementById('autoplay');
        const durationInput = this.shadowRoot.getElementById('duration');
        const nextButton = this.shadowRoot.getElementById('next-button');

        if (autoplay.checked) {
            if (nextButton) nextButton.remove();

            if (!durationInput) {
                const duration = document.createElement('input');
                duration.type = 'number';
                duration.id = 'duration';
                duration.value = this.animationDuration;
                duration.classList.add('form-control');
                duration.addEventListener('change', (e) => {
                    this.animationDuration = Number.parseInt(e.target.value, 10);
                    this.restartAnimation();
                });
                controls.appendChild(duration);
            }
        } else {
            if (durationInput) durationInput.remove();

            if (!nextButton) {
                const button = document.createElement('button');
                button.textContent = 'Next';
                button.classList.add('form-control');
                button.id = 'next-button';
                button.addEventListener('click', () => this.showNewMantras());
                controls.appendChild(button);
            }
        }
    }

    populateSelectors() {
        const categorySelector = this.shadowRoot.getElementById('category-selector');
        if (!categorySelector || !this.data?.categories) return;

        for (const [key, value] of Object.entries(this.data.categories)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value[this.selectedLanguage];
            categorySelector.appendChild(option);
        }
    }

    getRandomMantra(exclude = []) {
        if (!this.data?.mantras) return '';

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
        bubble.offsetWidth = 0;
        bubble.textContent = mantra;

        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = this.container;
        const margin = 30;
        const effectiveHeight = containerHeight - margin * 2;
        const effectiveWidth = containerWidth - margin * 2;
        const baseSize = Math.min(effectiveWidth, effectiveHeight);
        const estimatedFontSize = 20;
        const minSize = Math.sqrt(mantra.length) * estimatedFontSize;
        const randomSize = Math.random() * (baseSize * 0.3) + (baseSize * 0.5);
        let size = Math.max(minSize, randomSize);
        size = Math.min(size, baseSize);

        const maxTop = effectiveHeight - size;
        const maxLeft = effectiveWidth - size;

        const top = Math.random() * maxTop + margin;
        const left = Math.random() * maxLeft + margin;

        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

        Object.assign(bubble.style, {
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}px`,
            left: `${left}px`,
            backgroundColor: randomColor,
            animation: `mantra-enter ${this.transitionDuration / 1000}s forwards, mantra-idle-float 8s ease-in-out 1s infinite alternate`,
            pointerEvents: 'auto',
        });
    }

    showNewMantras() {
        if (!this.data) return;
        const prevBubble = this.activeBubbleIndex >= 0 ? this.bubbles[this.activeBubbleIndex] : null;
        this.activeBubbleIndex = (this.activeBubbleIndex + 1) % this.bubbles.length;
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
        for (let b of this.bubbles) { b.style.opacity = 0 };
        const categorySelector = this.shadowRoot.getElementById('category-selector');
        if (categorySelector && this.data?.categories) {
            for (const option of categorySelector.options) {
                option.textContent = this.data.categories[option.value][this.selectedLanguage];
            }
        }

        this.startAnimationLoop();
    }
}

customElements.define('mantra-bubbles', MantraBubbles);
