class GeoidCalculator {
    constructor() {
        this.lang = 'hu';
        this.translations = {};
        this.currentStep = 0; // Start at the first step
        this.totalSteps = 4;

        this.elements = {
            title: document.querySelector('#page-title-h2'),
            langControls: document.getElementById('lang-controls'),
            diagramContainer: document.getElementById('diagram-container'),
            stepsContainer: document.getElementById('calculation-steps'),
            nextStepBtn: document.getElementById('next-step-btn'),
        };

        this.init();
    }

    async init() {
        try {
            await this.loadTranslations();
            await this.loadDiagram();
            this.setupEventListeners();
            this.setLanguage(this.lang, true); // Initial setup
        } catch (error) {
            console.error("Initialization failed:", error);
            this.elements.stepsContainer.innerHTML = `<div class="alert alert-danger">Failed to initialize application.</div>`;
        }
    }

    async loadTranslations() {
        const response = await fetch('translations.json');
        if (!response.ok) throw new Error('Failed to load translations.');
        this.translations = await response.json();
    }

    async loadDiagram() {
        const response = await fetch('diagram.svg');
        if (!response.ok) throw new Error('Failed to load SVG diagram.');
        const svgText = await response.text();
        this.elements.diagramContainer.innerHTML = svgText;
        this.svgDoc = this.elements.diagramContainer.querySelector('svg');
    }

    setupEventListeners() {
        this.elements.langControls.addEventListener('click', (e) => {
            if (e.target.dataset.lang) {
                this.setLanguage(e.target.dataset.lang, false);
            }
        });

        this.elements.nextStepBtn.addEventListener('click', () => this.showNextStep());

        this.elements.stepsContainer.addEventListener('click', (e) => {
            const stepElement = e.target.closest('.list-group-item');
            if (stepElement && stepElement.dataset.stepIndex) {
                this.currentStep = parseInt(stepElement.dataset.stepIndex, 10);
                this.highlightStep(this.currentStep);
            }
        });
    }

    setLanguage(lang, isInitialLoad = false) {
        this.lang = lang;
        const t = this.translations[lang];
        if (!t) return;

        this.elements.title.textContent = t.title;
        this.elements.nextStepBtn.textContent = t.next_step;

        this.elements.langControls.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        this.renderSteps();

        if (isInitialLoad) {
            // On first load, reveal the first step without animation
            const firstStepEl = this.elements.stepsContainer.querySelector(`[data-step-index="0"]`);
            if(firstStepEl) firstStepEl.classList.add('visible');
        }

        this.highlightStep(this.currentStep);
    }

    renderSteps() {
        const t = this.translations[this.lang];
        this.elements.stepsContainer.innerHTML = `
            <div class="list-group">
                ${t.steps.map((step, index) => `
                    <a href="#" class="list-group-item list-group-item-action" data-step-index="${index}">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${step.title}</h5>
                        </div>
                        <p class="mb-1">${step.content}</p>
                    </a>
                `).join('')}
            </div>`;

        // Make already shown steps visible
        for (let i = 0; i <= this.currentStep; i++) {
            const stepEl = this.elements.stepsContainer.querySelector(`[data-step-index="${i}"]`);
            if (stepEl) stepEl.classList.add('visible');
        }
    }

    showNextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            const stepEl = this.elements.stepsContainer.querySelector(`[data-step-index="${this.currentStep}"]`);
            if (stepEl) {
                stepEl.classList.add('visible');
                this.highlightStep(this.currentStep);
            }
        }
        if (this.currentStep >= this.totalSteps - 1) {
            this.elements.nextStepBtn.style.display = 'none';
        }
    }

    highlightStep(index) {
        if (index < 0 || index >= this.totalSteps) return;

        // Highlight text step using Bootstrap's 'active' class
        this.elements.stepsContainer.querySelectorAll('.list-group-item').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });

        // Highlight SVG parts
        if (this.svgDoc) {
            this.svgDoc.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
            this.svgDoc.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));

            const t = this.translations[this.lang];
            for (let i = 0; i <= index; i++) {
                const diagramIds = t.steps[i].diagram_ids;
                diagramIds.forEach(id => {
                    const svgEl = this.svgDoc.getElementById(id);
                    if (svgEl) {
                        svgEl.classList.add('visible');
                        if (i === index) {
                            svgEl.classList.add('highlighted');
                        }
                    }
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new GeoidCalculator());