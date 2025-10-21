class FramesComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = null;
        this.currentCategory = null;
        this.currentCharacter = null;
        this.currentQuoteIndex = 0;
        this.currentPrivacy = 'public';
        this.timer = null;
    }

    async connectedCallback() {
        await this.loadData();
        this.render();
        this.startTimer();
    }

    disconnectedCallback() {
        this.stopTimer();
    }

    async loadData() {
        try {
            const response = await fetch('frames.json');
            this.data = await response.json();
            this.currentCategory = Object.keys(this.data.categories)[0];
            this.currentCharacter = Object.keys(this.data.categories[this.currentCategory].characters)[0];
            this.currentPrivacy = Object.keys(this.data.categories[this.currentCategory].privacy)[0]
        } catch (error) {
            console.error('Error loading frames.json:', error);
        }
    }

    get characters() {
        return this.data ? Object.keys(this.data.categories[this.currentCategory].characters) : [];
    }

    get quotes() {
        return this.data ? this.data.categories[this.currentCategory].characters[this.currentCharacter].quotes : [];
    }

    get currentCharacterData() {
        return this.data ? this.data.categories[this.currentCategory].characters[this.currentCharacter] : {};
    }

    render() {
        const categories = Object.keys(this.data.categories);
        const quote = this.quotes[this.currentQuoteIndex];

        this.shadowRoot.innerHTML = `
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
            <style>
                :host {
                    --primary-color: #6c5ce7;
                    --secondary-color: #a29bfe;
                    --background-color: #2d3436;
                    --text-color: #dfe6e9;
                    --card-background: #353b48;
                }
                .card {
                    background-color: var(--card-background);
                    color: var(--text-color);
                    border: none;
                    border-radius: 15px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                .form-select {
                    background-color: #555;
                    color: var(--text-color);
                    border-color: #444;
                }
                .character-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid var(--primary-color);
                    padding: 3px;
                    background-color: var(--background-color);
                }
                .quote-container {
                    opacity: 1;
                    transition: opacity 0.5s ease-in-out;
                }
                .quote-container.fade-out {
                    opacity: 0;
                }
                .speech-bubble {
                    position: relative;
                    background: var(--primary-color);
                    color: white;
                    border-radius: .4em;
                    padding: 1.2em;
                    font-size: 1.1em;
                    font-style: italic;
                }
                .speech-bubble:after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border: 20px solid transparent;
                    border-top-color: var(--primary-color);
                    border-bottom: 0;
                    border-left: 0;
                    margin-left: -10px;
                    margin-bottom: -20px;
                }
                .btn-control {
                    background: transparent;
                    border: 1px solid var(--primary-color);
                    color: var(--primary-color);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                }
                .btn-control:hover {
                    background: var(--primary-color);
                    color: white;
                }
                .progress-bar {
                    background-color: var(--primary-color);
                }
            </style>
            <div class="container my-5">
                <div class="card p-4">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <select id="category-select" class="form-select">
                                ${categories.map(cat => `<option value="${cat}" ${this.currentCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <select id="character-select" class="form-select">
                                ${this.characters.map(char => `<option value="${char}" ${this.currentCharacter === char ? 'selected' : ''}>${char}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="card-body text-center quote-container">
                        <div class="speech-bubble mb-4">
                            <p class="mb-0">${quote}</p>
                        </div>
                        <img src="${this.currentCharacterData.image}" alt="${this.currentCharacter}" class="character-image mt-3">
                        <h4 class="mt-3 mb-0">${this.currentCharacter}</h4>
                        <p><cite>${this.currentCategory}</cite></p>
                    </div>
                    <div class="card-footer bg-transparent border-0 d-flex justify-content-center align-items-center pt-4">
                        <button id="prev-btn" class="btn btn-control mx-2"><i class="bi bi-arrow-left"></i></button>
                        <div class="progress mx-3" style="width: 50%; height: 5px;">
                            <div id="timer-bar" class="progress-bar" role="progressbar" style="width: 0%;"></div>
                        </div>
                        <button id="next-btn" class="btn btn-control mx-2"><i class="bi bi-arrow-right"></i></button>
                    </div>
                    <div class="text-muted text-right">${this.currentPrivacy}</div>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        this.shadowRoot.getElementById('category-select').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentCharacter = Object.keys(this.data.categories[this.currentCategory].characters)[0];
            this.currentQuoteIndex = 0;
            this.render();
            this.resetTimer();
        });

        this.shadowRoot.getElementById('character-select').addEventListener('change', (e) => {
            this.currentCharacter = e.target.value;
            this.currentQuoteIndex = 0;
            this.render();
            this.resetTimer();
        });

        this.shadowRoot.getElementById('prev-btn').addEventListener('click', () => this.showPrev());
        this.shadowRoot.getElementById('next-btn').addEventListener('click', () => this.showNext());
    }

    changeQuote(next = true) {
        const quoteContainer = this.shadowRoot.querySelector('.quote-container');
        quoteContainer.classList.add('fade-out');

        setTimeout(() => {
            if (next) {
                this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
            } else {
                this.currentQuoteIndex = (this.currentQuoteIndex - 1 + this.quotes.length) % this.quotes.length;
            }
            this.render();
            this.resetTimer();
        }, 1000);
    }

    showNext() {
        this.changeQuote(true);
    }

    showPrev() {
        this.changeQuote(false);
    }

    startTimer() {
        this.stopTimer();
        const timerBar = this.shadowRoot.getElementById('timer-bar');
        let width = 0;
        this.timer = setInterval(() => {
            if (width >= 100) {
                this.showNext();
            } else {
                width++;
                if (timerBar) timerBar.style.width = width + '%';
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    resetTimer() {
        this.startTimer();
    }
}

customElements.define('frames-component', FramesComponent);