class MyProjects extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.loadProjects();
    }

    async loadProjects() {
        const src = this.getAttribute('src');
        if (!src) {
            console.error('MyProjects component requires a "src" attribute.');
            this.shadowRoot.innerHTML = `<p>Error: src attribute is missing.</p>`;
            return;
        }
        try {
            const response = await fetch(src);
            const projects = await response.json();
            this.renderProjects(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            this.shadowRoot.innerHTML = `<p>Error loading projects.</p>`;
        }
    }

    renderProjects(projects) {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css">
      <style>
        .card {
          transition: all 0.4s ease;
          cursor: pointer;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
        }

        .card .description {
          display: block;
          height: 6rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .floating-card .description {
          height: auto;
          overflow: visible;
          display: block;
        }
        .card .tagList {
            height: 3.5rem;
            overflow: hidden;
        }
        .floating-card {
          position: fixed;
          z-index: 1000;
          margin: 0;
          transition: all 0.4s ease;
          overflow: hidden;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .floating-card.centered {
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%);
        }
        .floating-card.grow {
          margin-top: 5vh !important;
          width: 50vw !important;
          height: 80vh !important;
          overflow: auto;
          padding: 1rem;
        }
        @media (max-width: 768px) {
            .floating-card.grow {
                width: 95vw !important;
                height: 90vh !important;
                margin-top: 2.5vh !important;
            }
        }
        .invisible {
          visibility: hidden;
        }
        .arrow {
          width: 50px;
          height: 50px;
          background-color: rgba(33, 37, 41, 0.6);
          color: white;
          cursor: pointer;
          border-radius: 50%;
          z-index: 1001; /* Above the modal */
          transition: background-color 0.2s ease;
        }
        .arrow:hover {
            background-color: rgba(33, 37, 41, 0.8);
        }
        .floating-card .btn-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 1001;
        }
      </style>

      <div id="tag_filter" class="text-center mb-4"></div>
      <div class="row" id="portfolio_container"></div>
      <div class="arrow left d-none position-fixed top-50 start-0 ms-3 translate-middle-y d-flex justify-content-center align-items-center fs-4">&#11207;</div>
      <div class="arrow right d-none position-fixed top-50 end-0 me-3 translate-middle-y d-flex justify-content-center align-items-center fs-4">&#11208;</div>
    `;

        const tagFilterContainer = this.shadowRoot.querySelector('#tag_filter');
        const projectList = this.shadowRoot.querySelector('#portfolio_container');
        const leftArrow = this.shadowRoot.querySelector('.arrow.left');
        const rightArrow = this.shadowRoot.querySelector('.arrow.right');

        let activeFloating = null;
        let currentIndex = -1;
        const cards = [];

        // Unique sorted tags
        const allTags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();

        const updateButtonStyles = (activeButton) => {
            tagFilterContainer.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            activeButton.classList.remove('btn-outline-primary');
            activeButton.classList.add('btn-primary');
        };

        // Tag button factory
        const createTagButton = (tagName) => {
            const button = document.createElement('button');
            button.textContent = tagName;
            button.classList.add("btn", "btn-sm", "m-1", "p-1");
            button.addEventListener('click', () => {
                updateButtonStyles(button);
                filterCards(tagName);
            });
            return button;
        };


        const filterCards = (tagName) => {
            cards.forEach(({ wrapper, tags }, index) => {
                const visible = tagName === 'All' || tags.includes(tagName);
                wrapper.classList.toggle('d-none', !visible);
                // Close floating card if it's filtered out
                if (!visible && index === currentIndex) {
                    closeFloatingCard();
                }
            });
        };

        const openFloatingCard = (index) => {
            if (index < 0 || index >= cards.length) return;

            const closeButton = document.createElement("button");
            closeButton.type = 'button';
            closeButton.className = 'btn-close';
            closeButton.setAttribute('aria-label', 'Close');
            closeButton.addEventListener('click', () => {
                closeFloatingCard();
            });
            const cardWrapper = cards[index].wrapper;
            const rect = cardWrapper.getBoundingClientRect();
            const clone = cardWrapper.querySelector('.card').cloneNode(true);
            cardWrapper.classList.add('invisible'); // Hide original card's wrapper
            clone.classList.remove('h-100', 'shadow-sm'); // Keep .card, remove others
            clone.classList.add('floating-card');
            clone.appendChild(closeButton);
            clone.style.top = `${rect.top}px`;
            clone.style.left = `${rect.left}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;

            this.shadowRoot.appendChild(clone);
            activeFloating = clone;
            currentIndex = index;

            leftArrow.classList.remove('d-none');
            rightArrow.classList.remove('d-none');

            requestAnimationFrame(() => {
                clone.classList.add('centered');
                setTimeout(() => {
                    clone.classList.add('grow');
                }, 400);
            });


        };

        const closeFloatingCard = () => {
            if (!activeFloating) return;

            const originalCardWrapper = cards[currentIndex].wrapper;
            const clone = activeFloating;
            const closeBtn = clone.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.remove();
            }

            clone.classList.remove('grow');
            setTimeout(() => {
                clone.classList.remove('centered');
                setTimeout(() => {
                    clone.remove();
                    activeFloating = null;
                    originalCardWrapper.classList.remove('invisible');
                    leftArrow.classList.add('d-none');
                    rightArrow.classList.add('d-none');
                }, 400);
            }, 10);
        };

        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const visibleIndexes = cards.map((c, i) => ({ i, visible: !c.wrapper.classList.contains('d-none') }))
                .filter(c => c.visible)
                .map(c => c.i);
            const current = visibleIndexes.indexOf(currentIndex);
            const nextIndex = visibleIndexes[(current - 1 + visibleIndexes.length) % visibleIndexes.length];
            closeFloatingCard();
            setTimeout(() => openFloatingCard(nextIndex), 500);
        });

        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const visibleIndexes = cards.map((c, i) => ({ i, visible: !c.wrapper.classList.contains('d-none') }))
                .filter(c => c.visible)
                .map(c => c.i);
            const current = visibleIndexes.indexOf(currentIndex);
            const nextIndex = visibleIndexes[(current + 1) % visibleIndexes.length];
            closeFloatingCard();
            setTimeout(() => openFloatingCard(nextIndex), 500);
        });

        // Populate filter buttons
        const allBtn = createTagButton('All');
        tagFilterContainer.appendChild(allBtn);
        allTags.forEach(tag => tagFilterContainer.appendChild(createTagButton(tag)));
        updateButtonStyles(allBtn); // Set 'All' as active initially

        // Create all project cards
        projects.forEach((project, index) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-lg-4 col-md-6 mb-4';
            cardWrapper.setAttribute('data-aos', 'fade-up');

            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm';

            // Programmatic element creation is safer than innerHTML
            const img = document.createElement('img');
            img.className = 'card-img-top';
            img.src = project.image;
            img.alt = project.title;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = project.title;

            const tagListContainer = document.createElement('div');
            tagListContainer.className = 'tagList py-1';
            project.tags.forEach(tagText => {
                const tagEl = document.createElement('span');
                tagEl.className = 'badge rounded-pill bg-primary mx-1';
                tagEl.textContent = tagText;
                tagListContainer.appendChild(tagEl);
            });

            const description = document.createElement('p');
            description.className = 'card-text description';
            description.textContent = project.description;

            cardBody.append(title, tagListContainer, description);

            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';

            const link = document.createElement('a');
            link.className = 'btn btn-primary btn-small';
            link.textContent = project.link ? 'Repository' : 'Internal project';
            project.link ? (link.href = project.link) : link.classList.add('disabled');

            const date = document.createElement('small');
            date.className = 'text-muted';
            date.innerHTML = `<br>Publication date: ${project.date}`; // Using innerHTML for <br> is acceptable here

            cardFooter.append(link, date);
            card.append(img, cardBody, cardFooter);

            card.addEventListener('click', () => {
                if (activeFloating) {
                    closeFloatingCard();
                    setTimeout(() => openFloatingCard(index), 500);
                } else {
                    openFloatingCard(index);
                }
            });

            cardWrapper.appendChild(card);
            cards.push({ wrapper: cardWrapper, tags: project.tags });
            projectList.appendChild(cardWrapper);
        });
    }
}

export default MyProjects;
