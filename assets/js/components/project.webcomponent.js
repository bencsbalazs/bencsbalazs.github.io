/**
 * @class ProjectsSection
 * @description A web component to display a filterable portfolio of projects with a modal-like detail view.
 * 
 * @property {string} src - The URL to the JSON file containing the projects data.
 */
class ProjectsSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.projects = [];
        this.cards = [];
        this.activeFloatingCard = null;
        this.currentIndex = -1;
    }

    async connectedCallback() {
        try {
            this.projects = await this.fetchProjects();
            this.render();
            this.addEventListeners();
        } catch (error) {
            console.error('Failed to initialize ProjectsSection:', error);
            this.shadowRoot.innerHTML = `<p class="text-danger text-center">Failed to load projects.</p>`;
        }
    }

    async fetchProjects() {
        const src = this.getAttribute('src');
        if (!src) throw new Error('The "src" attribute is required.');
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
        return response.json();
    }

    render() {
        const allTags = Array.from(new Set(this.projects.flatMap(p => p.tags))).sort();
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css">
            <link rel="stylesheet" href="/assets/css/style.css">
            <style>
                .card { transition: all 0.2s ease-in-out; cursor: pointer; border: none; background: white; border: 1px solid #dadce0; color: #3c4043; }
                .card:hover { transform: translateY(-1px); box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15); } 
                .card .description { display: block; height: 6rem; overflow: hidden; text-overflow: ellipsis; color: #5f6368; }
                .card .tagList { height: 3.5rem; overflow: hidden; }
                .floating-card { position: fixed; z-index: 1000; margin: 0; transition: all 0.4s ease; overflow: hidden; background: white; box-shadow: 0 4px 8px 3px rgba(60,64,67,0.15); border: 1px solid #dadce0; color: #3c4043; border-radius: 8px; }
                .floating-card .description { height: auto; overflow: visible; display: block; color: #3c4043; }
                .floating-card.centered { top: 50% !important; left: 50% !important; transform: translate(-50%, -50%); }
                .floating-card.grow { margin-top: 5vh !important; width: 50vw !important; height: 80vh !important; overflow: auto; padding: 1rem; }
                @media (max-width: 768px) { .floating-card.grow { width: 95vw !important; height: 90vh !important; margin-top: 2.5vh !important; } }
                .arrow { width: 50px; height: 50px; background-color: white; color: #5f6368; cursor: pointer; border-radius: 50%; z-index: 1001; transition: all 0.2s ease; border: 1px solid #dadce0; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3); }
                .arrow:hover { background-color: #f8f9fa; transform: scale(1.1); color: #1a73e8; }
                .floating-card .btn-close { position: absolute; top: 1rem; right: 1rem; z-index: 1001; }
            </style>

            <div id="tag-filter" class="text-center mb-4">
                <button class="btn btn-sm btn-primary m-1 p-1 rounded-pill" data-tag="All">All</button>
                ${allTags.map(tag => `<button class="btn btn-sm btn-outline-primary m-1 p-1 rounded-pill" data-tag="${tag}">${tag}</button>`).join('')}
            </div>
            <div id="portfolio-container" class="row">
                ${this.projects.map((project, index) => this.createProjectCardHTML(project, index)).join('')}
            </div>
            <div id="arrow-left" class="arrow left d-none position-fixed top-50 start-0 ms-3 translate-middle-y d-flex justify-content-center align-items-center fs-4">&#11207;</div>
            <div id="arrow-right" class="arrow right d-none position-fixed top-50 end-0 me-3 translate-middle-y d-flex justify-content-center align-items-center fs-4">&#11208;</div>
        `;
        this.cards = Array.from(this.shadowRoot.querySelectorAll('[data-index]'));
    }

    createProjectCardHTML(project, index) {
        return `
            <div class="col-lg-4 col-md-6 mb-4" data-index="${index}" data-tags="${project.tags.join(',')}" data-aos="fade-up">
                <div class="card h-100 shadow-sm">
                    <img class="card-img-top" src="${project.image}" alt="${project.title}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${project.title}</h5>
                        <div class="tagList py-1">
                            ${project.tags.map(tag => `<span class="badge rounded-pill bg-primary mx-1">${tag}</span>`).join('')}
                        </div>
                        <p class="card-text description">${project.description}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${project.link || '#'}" class="btn btn-primary btn-small ${!project.link ? 'disabled' : ''}" target="_blank" rel="noopener noreferrer">Repository</a>
                        <small class="text-muted"><br>Publication date: ${project.date}</small>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        this.shadowRoot.getElementById('tag-filter').addEventListener('click', this.handleTagFilter.bind(this));
        this.shadowRoot.getElementById('portfolio-container').addEventListener('click', this.handleCardClick.bind(this));
        this.shadowRoot.getElementById('arrow-left').addEventListener('click', this.showPrevProject.bind(this));
        this.shadowRoot.getElementById('arrow-right').addEventListener('click', this.showNextProject.bind(this));
    }

    handleTagFilter(e) {
        if (e.target.tagName !== 'BUTTON') return;
        const selectedTag = e.target.dataset.tag;
        this.shadowRoot.querySelectorAll('#tag-filter button').forEach(btn => {
            btn.classList.toggle('btn-primary', btn === e.target);
            btn.classList.toggle('btn-outline-primary', btn !== e.target);
        });
        this.cards.forEach(card => {
            const tags = card.dataset.tags.split(',');
            const isVisible = selectedTag === 'All' || tags.includes(selectedTag);
            card.classList.toggle('d-none', !isVisible);
            if (!isVisible && parseInt(card.dataset.index, 10) === this.currentIndex) {
                this.closeFloatingCard();
            }
        });
    }

    handleCardClick(e) {
        const cardWrapper = e.target.closest('[data-index]');
        if (!cardWrapper) return;
        // Prevent opening if the click was on the repository link
        if (e.target.closest('a')) return;

        const index = parseInt(cardWrapper.dataset.index, 10);
        if (this.activeFloatingCard) {
            this.closeFloatingCard().then(() => this.openFloatingCard(index));
        } else {
            this.openFloatingCard(index);
        }
    }

    openFloatingCard(index) {
        if (index < 0 || index >= this.cards.length) return;
        this.currentIndex = index;
        const originalCardWrapper = this.cards[index];
        const cardClone = originalCardWrapper.querySelector('.card').cloneNode(true);

        const closeButton = document.createElement('button');
        closeButton.className = 'btn-close';
        closeButton.onclick = () => this.closeFloatingCard();
        cardClone.appendChild(closeButton);

        const rect = originalCardWrapper.getBoundingClientRect();
        cardClone.classList.add('floating-card');
        cardClone.style.cssText = `top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px;`;

        originalCardWrapper.style.visibility = 'hidden';
        this.shadowRoot.appendChild(cardClone);
        this.activeFloatingCard = cardClone;

        this.shadowRoot.getElementById('arrow-left').classList.remove('d-none');
        this.shadowRoot.getElementById('arrow-right').classList.remove('d-none');

        requestAnimationFrame(() => {
            cardClone.classList.add('centered');
            setTimeout(() => cardClone.classList.add('grow'), 400);
        });
    }

    closeFloatingCard() {
        return new Promise(resolve => {
            if (!this.activeFloatingCard) return resolve();
            const originalCardWrapper = this.cards[this.currentIndex];
            const clone = this.activeFloatingCard;

            clone.classList.remove('grow');
            setTimeout(() => {
                clone.classList.remove('centered');
                setTimeout(() => {
                    clone.remove();
                    this.activeFloatingCard = null;
                    if (originalCardWrapper) originalCardWrapper.style.visibility = 'visible';
                    this.shadowRoot.getElementById('arrow-left').classList.add('d-none');
                    this.shadowRoot.getElementById('arrow-right').classList.add('d-none');
                    resolve();
                }, 400);
            }, 10);
        });
    }

    navigateProjects(direction) {
        const visibleIndexes = this.cards
            .filter(c => !c.classList.contains('d-none'))
            .map(c => parseInt(c.dataset.index, 10));
        const currentVisibleIndex = visibleIndexes.indexOf(this.currentIndex);
        const nextVisibleIndex = (currentVisibleIndex + direction + visibleIndexes.length) % visibleIndexes.length;
        const nextIndex = visibleIndexes[nextVisibleIndex];

        this.closeFloatingCard().then(() => this.openFloatingCard(nextIndex));
    }

    showPrevProject() {
        this.navigateProjects(-1);
    }

    showNextProject() {
        this.navigateProjects(1);
    }
}

export default ProjectsSection;