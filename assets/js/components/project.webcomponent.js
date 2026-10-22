/**
 * @class ProjectsSection
 * @description A modern, accessible web component to display a filterable portfolio of projects
 * with Bootstrap 5 styling and a polished detail modal view.
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
        this.boundKeyHandler = null;
    }

    async connectedCallback() {
        try {
            this.projects = await this.fetchProjects();
            this.render();
            this.addEventListeners();
        } catch (error) {
            console.error('Failed to initialize ProjectsSection:', error);
            this.shadowRoot.innerHTML = `
                <div class="alert alert-danger text-center my-4 mx-auto" style="max-width: 500px;" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>Failed to load projects. Please try again later.
                </div>
            `;
        }
    }

    disconnectedCallback() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
    }

    async fetchProjects() {
        const src = this.getAttribute('src');
        if (!src) throw new Error('The "src" attribute is required.');
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
        return response.json();
    }

    getRepoInfo(link) {
        if (!link) {
            return {
                icon: 'bi-shield-lock',
                label: 'Internal Project',
                isExternal: false
            };
        }
        if (link.includes('gitlab')) {
            return {
                icon: 'bi-git',
                label: 'GitLab',
                isExternal: true
            };
        }
        if (link.includes('github')) {
            return {
                icon: 'bi-github',
                label: 'GitHub',
                isExternal: true
            };
        }
        return {
            icon: 'bi-box-arrow-up-right',
            label: 'Repository',
            isExternal: true
        };
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        if (dateStr.toLowerCase().includes('dev')) {
            return 'In Development';
        }
        return dateStr;
    }

    render() {
        const tagCounts = {};
        this.projects.forEach(p => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        const allTags = Object.keys(tagCounts).sort();

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
            <link rel="stylesheet" href="/assets/css/style.css">
            <style>
                :host {
                    display: block;
                    --primary-color: #1a73e8;
                    --primary-hover: #1557b0;
                    --primary-subtle-bg: rgba(26, 115, 232, 0.08);
                    --primary-subtle-border: rgba(26, 115, 232, 0.2);
                    --card-border: rgba(0, 0, 0, 0.08);
                    --text-body: #5f6368;
                    --text-heading: #202124;
                }

                /* Bootstrap primary override for consistency with theme */
                .btn-primary {
                    background-color: var(--primary-color) !important;
                    border-color: var(--primary-color) !important;
                    color: #ffffff !important;
                }
                .btn-primary:hover, .btn-primary:focus {
                    background-color: var(--primary-hover) !important;
                    border-color: var(--primary-hover) !important;
                }
                .btn-outline-primary {
                    color: var(--primary-color) !important;
                    border-color: var(--primary-color) !important;
                }
                .btn-outline-primary:hover, .btn-outline-primary:focus {
                    background-color: var(--primary-color) !important;
                    border-color: var(--primary-color) !important;
                    color: #ffffff !important;
                }

                /* Filter bar */
                .filter-pill {
                    border: 1px solid #dadce0;
                    background: #ffffff;
                    color: var(--text-body);
                    font-weight: 500;
                    font-size: 0.875rem;
                    padding: 0.45rem 1rem;
                    border-radius: 50rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                }
                .filter-pill:hover {
                    background: #f8f9fa;
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                    transform: translateY(-1px);
                }
                .filter-pill.active {
                    background: var(--primary-color);
                    color: #ffffff;
                    border-color: var(--primary-color);
                    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.28);
                }
                .filter-pill .badge-count {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.15rem 0.55rem;
                    border-radius: 50rem;
                    background: #f1f3f4;
                    color: var(--text-body);
                    transition: all 0.2s ease;
                }
                .filter-pill.active .badge-count {
                    background: rgba(255, 255, 255, 0.25);
                    color: #ffffff;
                }

                /* Project Cards */
                .project-card {
                    border: 1px solid var(--card-border);
                    border-radius: 0.875rem;
                    background: #ffffff;
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                                box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                                border-color 0.25s ease;
                    cursor: pointer;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .project-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 16px 32px -8px rgba(26, 115, 232, 0.16), 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-color: rgba(26, 115, 232, 0.35);
                }
                .project-card:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                /* Image Box */
                .project-img-box {
                    height: 200px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #f1f3f4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    padding: 1.25rem;
                }
                .project-img-box img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .project-card:hover .project-img-box img {
                    transform: scale(1.05);
                }
                .quick-view-badge {
                    position: absolute;
                    bottom: 0.75rem;
                    right: 0.75rem;
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    color: var(--text-body);
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.3rem 0.65rem;
                    border-radius: 50rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    opacity: 0;
                    transform: translateY(4px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }
                .project-card:hover .quick-view-badge {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Tags & Pills */
                .project-tag {
                    display: inline-block;
                    background: var(--primary-subtle-bg);
                    color: var(--primary-color);
                    border: 1px solid var(--primary-subtle-border);
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.25rem 0.65rem;
                    border-radius: 50rem;
                    letter-spacing: 0.01em;
                    transition: background 0.15s ease;
                }
                .project-card:hover .project-tag {
                    background: rgba(26, 115, 232, 0.12);
                }

                .modal-badge-pill {
                    background: var(--primary-subtle-bg);
                    color: var(--primary-color);
                    border: 1px solid var(--primary-subtle-border);
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.25rem 0.7rem;
                    border-radius: 50rem;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                }

                /* Card Body & Text */
                .card-title-link {
                    color: var(--text-heading);
                    font-weight: 600;
                    letter-spacing: -0.01em;
                }
                .project-card:hover .card-title-link {
                    color: var(--primary-color);
                }
                .card-description {
                    color: var(--text-body);
                    font-size: 0.875rem;
                    line-height: 1.55;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-height: 4.1rem;
                }

                /* Card Footer */
                .card-footer-custom {
                    background: #ffffff;
                    border-top: 1px solid #f1f3f4;
                    padding: 0.85rem 1.25rem;
                }

                /* Backdrop */
                .modal-backdrop-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 1040;
                    opacity: 0;
                    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    overscroll-behavior: contain;
                }
                .modal-backdrop-custom.show {
                    opacity: 1;
                }

                /* Floating Modal Card */
                .floating-card {
                    position: fixed;
                    z-index: 1050;
                    margin: 0;
                    background: #ffffff;
                    border-radius: 1rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    overscroll-behavior: contain;
                }
                .floating-card.centered-grow {
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: min(740px, 92vw) !important;
                    height: min(84vh, 760px) !important;
                }
                .modal-card-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                }
                .modal-card-body {
                    overflow-y: auto;
                    flex: 1 1 auto;
                    min-height: 0;
                    overscroll-behavior: contain;
                }
                .modal-card-body::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-card-body::-webkit-scrollbar-track {
                    background: #f8f9fa;
                }
                .modal-card-body::-webkit-scrollbar-thumb {
                    background: #dadce0;
                    border-radius: 3px;
                }
                .modal-card-body::-webkit-scrollbar-thumb:hover {
                    background: #bdc1c6;
                }

                /* Modal image box */
                .modal-img-container {
                    height: 260px;
                    background: #f8f9fa;
                    border-radius: 0.75rem;
                    border: 1px solid #eaedf0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    overflow: hidden;
                }
                .modal-img-container img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                /* Navigation Arrows */
                .arrow-btn {
                    position: fixed;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    color: var(--text-heading);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 1060;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    font-size: 1.25rem;
                }
                .arrow-btn:hover {
                    background: #ffffff;
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                    transform: translateY(-50%) scale(1.1);
                    box-shadow: 0 8px 24px rgba(26, 115, 232, 0.3);
                }
                .arrow-btn.left { left: 1.5rem; }
                .arrow-btn.right { right: 1.5rem; }

                @media (max-width: 768px) {
                    .arrow-btn {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                    .arrow-btn.left { left: 0.5rem; }
                    .arrow-btn.right { right: 0.5rem; }
                    .floating-card.centered-grow {
                        width: 95vw !important;
                        height: 88vh !important;
                    }
                    .modal-img-container {
                        height: 180px;
                    }
                }
            </style>

            <!-- Filter Controls -->
            <div id="tag-filter" class="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-5" role="toolbar" aria-label="Project category filter">
                <button type="button" class="filter-pill active" data-tag="All" aria-pressed="true">
                    <span>All Projects</span>
                    <span class="badge-count">${this.projects.length}</span>
                </button>
                ${allTags.map(tag => `
                    <button type="button" class="filter-pill" data-tag="${tag}" aria-pressed="false">
                        <span>${tag}</span>
                        <span class="badge-count">${tagCounts[tag]}</span>
                    </button>
                `).join('')}
            </div>

            <!-- Portfolio Grid -->
            <div id="portfolio-container" class="row g-4">
                ${this.projects.map((project, index) => this.createProjectCardHTML(project, index)).join('')}
                <div id="no-projects-msg" class="col-12 text-center py-5 d-none">
                    <div class="p-4 rounded-4 bg-light border d-inline-block shadow-sm">
                        <i class="bi bi-folder-x text-muted fs-1 mb-2 d-block"></i>
                        <p class="text-muted mb-0 fw-medium">No projects found matching the selected tag.</p>
                    </div>
                </div>
            </div>

            <!-- Modal Backdrop -->
            <div id="modal-backdrop" class="modal-backdrop-custom d-none" aria-hidden="true"></div>

            <!-- Navigation Arrows -->
            <button type="button" id="arrow-left" class="arrow-btn left d-none" aria-label="Previous project" title="Previous project (←)">
                <i class="bi bi-chevron-left"></i>
            </button>
            <button type="button" id="arrow-right" class="arrow-btn right d-none" aria-label="Next project" title="Next project (→)">
                <i class="bi bi-chevron-right"></i>
            </button>
        `;

        this.cards = Array.from(this.shadowRoot.querySelectorAll('[data-index]'));
    }

    createProjectCardHTML(project, index) {
        const repoInfo = this.getRepoInfo(project.link);
        const formattedDate = this.formatDate(project.date);
        const tags = Array.isArray(project.tags) ? project.tags : [];

        return `
            <div class="col-lg-4 col-md-6" data-index="${index}" data-tags="${tags.join(',')}" data-aos="fade-up">
                <div class="card h-100 project-card shadow-sm" role="button" tabindex="0" aria-label="View details for ${project.title}">
                    <div class="project-img-box">
                        <img src="${project.image}" alt="${project.title}" loading="lazy">
                        <span class="quick-view-badge">
                            <i class="bi bi-arrows-angle-expand"></i> Details
                        </span>
                    </div>

                    <div class="card-body d-flex flex-column p-4 flex-grow-1">
                        <h3 class="card-title h5 card-title-link mb-2">${project.title}</h3>
                        
                        <div class="tag-list d-flex flex-wrap gap-1 mb-3">
                            ${tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                        </div>

                        <p class="card-text card-description flex-grow-1 mb-0">${project.description}</p>
                    </div>

                    <div class="card-footer-custom d-flex align-items-center justify-content-between">
                        <div>
                            ${repoInfo.isExternal
                                ? `<a href="${project.link}" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 shadow-none" target="_blank" rel="noopener noreferrer" title="Open repository">
                                     <i class="bi ${repoInfo.icon}"></i>
                                     <span>${repoInfo.label}</span>
                                   </a>`
                                : `<span class="badge bg-light text-muted border rounded-pill px-2.5 py-1.5 fw-normal d-inline-flex align-items-center gap-1" title="Internal repository">
                                     <i class="bi ${repoInfo.icon}"></i>
                                     <span>${repoInfo.label}</span>
                                   </span>`
                            }
                        </div>
                        <div class="text-muted small d-inline-flex align-items-center gap-1" title="Publication / Release date">
                            <i class="bi ${project.date && project.date.toLowerCase().includes('dev') ? 'bi-tools' : 'bi-calendar3'}"></i>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createDetailModalContentHTML(project, index) {
        const repoInfo = this.getRepoInfo(project.link);
        const formattedDate = this.formatDate(project.date);
        const tags = Array.isArray(project.tags) ? project.tags : [];
        const visibleCards = this.cards.filter(c => !c.classList.contains('d-none'));
        const visibleIndex = visibleCards.findIndex(c => parseInt(c.dataset.index, 10) === index);
        const counterText = visibleCards.length > 0 && visibleIndex !== -1 
            ? `Project ${visibleIndex + 1} of ${visibleCards.length}` 
            : '';

        return `
            <div class="modal-card-content">
                <!-- Modal Header -->
                <div class="d-flex align-items-center justify-content-between p-3 px-4 border-bottom bg-white">
                    <div class="d-flex align-items-center gap-2 overflow-hidden me-3">
                        <span class="modal-badge-pill">Project</span>
                        <h4 class="h5 fw-bold text-dark mb-0 text-truncate">${project.title}</h4>
                    </div>
                    <button type="button" class="btn-close shadow-none" aria-label="Close project modal"></button>
                </div>

                <!-- Modal Scrollable Body -->
                <div class="modal-card-body p-4">
                    <!-- Project Image Showcase -->
                    <div class="modal-img-container mb-4">
                        <img src="${project.image}" alt="${project.title}">
                    </div>

                    <!-- Tags -->
                    <div class="mb-4">
                        <div class="small fw-semibold text-uppercase text-muted mb-2 d-flex align-items-center gap-1.5">
                            <i class="bi bi-tags text-primary"></i> Technologies & Skills
                        </div>
                        <div class="d-flex flex-wrap gap-1.5">
                            ${tags.map(t => `<span class="project-tag px-3 py-1.5">${t}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mb-2">
                        <div class="small fw-semibold text-uppercase text-muted mb-2 d-flex align-items-center gap-1.5">
                            <i class="bi bi-text-left text-primary"></i> Project Overview
                        </div>
                        <p class="text-secondary leading-relaxed mb-0" style="white-space: pre-line; line-height: 1.7; font-size: 0.95rem;">
                            ${project.description}
                        </p>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="d-flex align-items-center justify-content-between p-3 px-4 border-top bg-light">
                    <div class="d-flex align-items-center gap-2">
                        ${repoInfo.isExternal
                            ? `<a href="${project.link}" class="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-medium shadow-sm" target="_blank" rel="noopener noreferrer">
                                 <i class="bi ${repoInfo.icon}"></i>
                                 <span>View ${repoInfo.label}</span>
                                 <i class="bi bi-box-arrow-up-right small"></i>
                               </a>`
                            : `<span class="badge bg-white text-secondary border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm">
                                 <i class="bi ${repoInfo.icon}"></i>
                                 <span>Internal / Proprietary Project</span>
                               </span>`
                        }
                    </div>
                    <div class="d-flex flex-column align-items-end text-muted small">
                        <span class="d-inline-flex align-items-center gap-1 fw-medium text-dark">
                            <i class="bi ${project.date && project.date.toLowerCase().includes('dev') ? 'bi-tools' : 'bi-calendar-check'} text-primary"></i>
                            <span>${formattedDate}</span>
                        </span>
                        ${counterText ? `<span class="text-muted" style="font-size: 0.75rem;">${counterText}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        this.shadowRoot.getElementById('tag-filter').addEventListener('click', this.handleTagFilter.bind(this));
        
        const container = this.shadowRoot.getElementById('portfolio-container');
        container.addEventListener('click', this.handleCardClick.bind(this));
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('a')) return;
                const cardWrapper = e.target.closest('[data-index]');
                if (cardWrapper) {
                    e.preventDefault();
                    this.handleCardClick({ target: cardWrapper });
                }
            }
        });

        const backdrop = this.shadowRoot.getElementById('modal-backdrop');
        backdrop.addEventListener('click', () => this.closeFloatingCard());

        this.shadowRoot.getElementById('arrow-left').addEventListener('click', this.showPrevProject.bind(this));
        this.shadowRoot.getElementById('arrow-right').addEventListener('click', this.showNextProject.bind(this));

        // Global keyboard controls
        this.boundKeyHandler = (e) => {
            if (!this.activeFloatingCard) return;
            if (e.key === 'Escape') {
                this.closeFloatingCard();
            } else if (e.key === 'ArrowLeft') {
                this.showPrevProject();
            } else if (e.key === 'ArrowRight') {
                this.showNextProject();
            }
        };
        document.addEventListener('keydown', this.boundKeyHandler);
    }

    handleTagFilter(e) {
        const btn = e.target.closest('button[data-tag]');
        if (!btn) return;
        const selectedTag = btn.dataset.tag;

        this.shadowRoot.querySelectorAll('#tag-filter button').forEach(button => {
            const isActive = (button === btn);
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        let visibleCount = 0;
        this.cards.forEach(card => {
            const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
            const isVisible = selectedTag === 'All' || tags.includes(selectedTag);
            card.classList.toggle('d-none', !isVisible);
            if (isVisible) visibleCount++;

            if (!isVisible && parseInt(card.dataset.index, 10) === this.currentIndex) {
                this.closeFloatingCard();
            }
        });

        const noProjectsMsg = this.shadowRoot.getElementById('no-projects-msg');
        if (noProjectsMsg) {
            noProjectsMsg.classList.toggle('d-none', visibleCount > 0);
        }

        // If modal is open, update arrow visibility
        if (this.activeFloatingCard) {
            const arrowsVisible = visibleCount > 1;
            this.shadowRoot.getElementById('arrow-left').classList.toggle('d-none', !arrowsVisible);
            this.shadowRoot.getElementById('arrow-right').classList.toggle('d-none', !arrowsVisible);
        }
    }

    handleCardClick(e) {
        const cardWrapper = e.target.closest('[data-index]');
        if (!cardWrapper) return;
        // Prevent opening if the click was on the repository link
        if (e.target.closest('a')) return;

        const index = parseInt(cardWrapper.dataset.index, 10);
        if (this.activeFloatingCard) {
            if (this.currentIndex === index) return;
            this.updateFloatingCardContent(index);
        } else {
            this.openFloatingCard(index);
        }
    }

    openFloatingCard(index) {
        if (index < 0 || index >= this.projects.length) return;
        this.currentIndex = index;
        const project = this.projects[index];
        const originalCardWrapper = this.cards[index];
        const rect = originalCardWrapper ? originalCardWrapper.getBoundingClientRect() : null;

        const cardModal = document.createElement('div');
        cardModal.className = 'floating-card';
        cardModal.setAttribute('role', 'dialog');
        cardModal.setAttribute('aria-modal', 'true');
        cardModal.setAttribute('aria-label', `${project.title} details`);
        cardModal.innerHTML = this.createDetailModalContentHTML(project, index);

        const closeBtn = cardModal.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeFloatingCard();
        }

        if (rect) {
            cardModal.style.top = `${rect.top}px`;
            cardModal.style.left = `${rect.left}px`;
            cardModal.style.width = `${rect.width}px`;
            cardModal.style.height = `${rect.height}px`;
            cardModal.style.opacity = '0.7';
        } else {
            cardModal.style.top = '50%';
            cardModal.style.left = '50%';
            cardModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
            cardModal.style.opacity = '0';
        }

        if (originalCardWrapper) {
            originalCardWrapper.style.visibility = 'hidden';
        }

        const backdrop = this.shadowRoot.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('d-none');
        }

        this.shadowRoot.appendChild(cardModal);
        this.activeFloatingCard = cardModal;

        const visibleCount = this.cards.filter(c => !c.classList.contains('d-none')).length;
        if (visibleCount > 1) {
            this.shadowRoot.getElementById('arrow-left').classList.remove('d-none');
            this.shadowRoot.getElementById('arrow-right').classList.remove('d-none');
        }

        requestAnimationFrame(() => {
            if (backdrop) backdrop.classList.add('show');
            requestAnimationFrame(() => {
                cardModal.classList.add('centered-grow');
                setTimeout(() => {
                    const btn = cardModal.querySelector('.btn-close');
                    if (btn) btn.focus();
                }, 350);
            });
        });
    }

    closeFloatingCard() {
        return new Promise(resolve => {
            if (!this.activeFloatingCard) return resolve();
            const originalCardWrapper = this.cards[this.currentIndex];
            const rect = originalCardWrapper ? originalCardWrapper.getBoundingClientRect() : null;
            const clone = this.activeFloatingCard;
            const backdrop = this.shadowRoot.getElementById('modal-backdrop');

            this.shadowRoot.getElementById('arrow-left').classList.add('d-none');
            this.shadowRoot.getElementById('arrow-right').classList.add('d-none');

            if (backdrop) backdrop.classList.remove('show');
            clone.classList.remove('centered-grow');

            if (rect) {
                clone.style.top = `${rect.top}px`;
                clone.style.left = `${rect.left}px`;
                clone.style.width = `${rect.width}px`;
                clone.style.height = `${rect.height}px`;
                clone.style.opacity = '0';
            } else {
                clone.style.opacity = '0';
                clone.style.transform = 'translate(-50%, -50%) scale(0.85)';
            }

            setTimeout(() => {
                clone.remove();
                this.activeFloatingCard = null;
                if (backdrop) backdrop.classList.add('d-none');
                if (originalCardWrapper) originalCardWrapper.style.visibility = 'visible';
                resolve();
            }, 350);
        });
    }

    updateFloatingCardContent(nextIndex, direction = 1) {
        if (!this.activeFloatingCard || nextIndex === this.currentIndex) return;

        const prevCard = this.cards[this.currentIndex];
        if (prevCard) prevCard.style.visibility = 'visible';

        this.currentIndex = nextIndex;
        const nextCard = this.cards[nextIndex];
        if (nextCard) nextCard.style.visibility = 'hidden';

        const project = this.projects[nextIndex];
        const modal = this.activeFloatingCard;

        const content = modal.querySelector('.modal-card-content');
        if (content) {
            content.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
            content.style.opacity = '0';
            content.style.transform = `translateX(${direction * -20}px)`;

            setTimeout(() => {
                modal.innerHTML = this.createDetailModalContentHTML(project, nextIndex);
                const closeBtn = modal.querySelector('.btn-close');
                if (closeBtn) {
                    closeBtn.onclick = () => this.closeFloatingCard();
                }

                const newContent = modal.querySelector('.modal-card-content');
                if (newContent) {
                    newContent.style.opacity = '0';
                    newContent.style.transform = `translateX(${direction * 20}px)`;
                    newContent.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                    requestAnimationFrame(() => {
                        newContent.style.opacity = '1';
                        newContent.style.transform = 'translateX(0)';
                    });
                }
            }, 150);
        } else {
            modal.innerHTML = this.createDetailModalContentHTML(project, nextIndex);
            const closeBtn = modal.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeFloatingCard();
            }
        }
    }

    navigateProjects(direction) {
        const visibleIndexes = this.cards
            .filter(c => !c.classList.contains('d-none'))
            .map(c => parseInt(c.dataset.index, 10));

        if (visibleIndexes.length <= 1) return;
        const currentVisibleIndex = visibleIndexes.indexOf(this.currentIndex);
        const nextVisibleIndex = (currentVisibleIndex + direction + visibleIndexes.length) % visibleIndexes.length;
        const nextIndex = visibleIndexes[nextVisibleIndex];

        if (this.activeFloatingCard) {
            this.updateFloatingCardContent(nextIndex, direction);
        } else {
            this.openFloatingCard(nextIndex);
        }
    }

    showPrevProject() {
        this.navigateProjects(-1);
    }

    showNextProject() {
        this.navigateProjects(1);
    }
}

export default ProjectsSection;