class MyProjects extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.loadProjects();
    }

    async loadProjects() {
        try {
            await fetch((window.location.protocol === 'http:'
                ? 'http://127.0.0.1:5500/'
                : 'https://bencsbalazs.github.io/') + 'assets/projects/projects.json')
                .then((response) => response.json())
                .then((data) => { this.renderProjects(data); });
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    renderProjects(projects) {
        this.innerHTML = `
      <style>
        #tag_filter {
          text-align: center;
          margin-bottom: 1rem;
        }
        #tag_filter button {
          margin: 0.2rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 20px;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
        }
        #tag_filter button.active {
          background: #0056b3;
        }
        #portfolio_container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: stretch;
          gap: 1rem;
        }
        .card {
          width: 18rem;
          transition: all 0.4s ease;
          cursor: pointer;
        }
        .card .description {
        display: block;
          height: 6rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .floating-card {
          position: fixed;
          z-index: 1000;
          margin: 0;
          transition: all 0.4s ease;
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
        .floating-card .description {
          height: auto;
          overflow: hidden;
        }
        .floating-card .card {
          width: 100%;
        }
        .hidden {
          visibility: hidden;
        }
        .arrow {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .arrow.left {
          left: 10px;
        }
        .arrow.right {
          right: 10px;
        }
      </style>

      <div id="tag_filter"></div>
      <div class="row" id="portfolio_container"></div>
      <div class="arrow left">&#8678;</div>
      <div class="arrow right">&#8680;</div>
    `;

        const tagFilterContainer = this.querySelector('#tag_filter');
        const projectList = this.querySelector('#portfolio_container');
        const leftArrow = this.querySelector('.arrow.left');
        const rightArrow = this.querySelector('.arrow.right');

        projectList.innerHTML = '';
        let activeFloating = null;
        let currentIndex = -1;
        const cards = [];

        // Unique sorted tags
        const allTags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();

        // Tag button factory
        const createTagButton = (tagName) => {
            const button = document.createElement('button');
            button.textContent = tagName;
            button.addEventListener('click', () => {
                // Remove 'active' from all buttons
                tagFilterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterCards(tagName);
            });
            return button;
        };

        // Populate filter buttons
        tagFilterContainer.appendChild(createTagButton('All')).classList.add('active');
        allTags.forEach(tag => tagFilterContainer.appendChild(createTagButton(tag)));

        const filterCards = (tagName) => {
            cards.forEach(({ element, tags }, index) => {
                const visible = tagName === 'All' || tags.includes(tagName);
                element.style.display = visible ? '' : 'none';
                // Close floating card if it's filtered out
                if (!visible && index === currentIndex) {
                    closeFloatingCard();
                }
            });
        };

        const openFloatingCard = (index) => {
            if (index < 0 || index >= cards.length) return;

            const card = cards[index].element;
            const rect = card.getBoundingClientRect();
            const clone = card.cloneNode(true);
            card.classList.add('hidden');
            clone.classList.remove(...card.classList);
            clone.classList.add('floating-card');
            clone.style.top = `${rect.top}px`;
            clone.style.left = `${rect.left}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;

            document.body.appendChild(clone);
            activeFloating = clone;
            currentIndex = index;

            leftArrow.style.display = 'flex';
            rightArrow.style.display = 'flex';

            requestAnimationFrame(() => {
                clone.classList.add('centered');
                setTimeout(() => {
                    clone.classList.add('grow');
                }, 400);
            });

            clone.addEventListener('click', () => {
                closeFloatingCard();
            });
        };

        const closeFloatingCard = () => {
            if (!activeFloating) return;

            const originalCard = cards[currentIndex].element;
            const clone = activeFloating;
            clone.classList.remove('grow');
            setTimeout(() => {
                clone.classList.remove('centered');
                setTimeout(() => {
                    clone.remove();
                    activeFloating = null;
                    originalCard.classList.remove('hidden');
                    leftArrow.style.display = 'none';
                    rightArrow.style.display = 'none';
                }, 400);
            }, 10);
        };

        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const visibleIndexes = cards.map((c, i) => ({ i, visible: c.element.style.display !== 'none' }))
                .filter(c => c.visible)
                .map(c => c.i);
            const current = visibleIndexes.indexOf(currentIndex);
            const nextIndex = visibleIndexes[(current - 1 + visibleIndexes.length) % visibleIndexes.length];
            closeFloatingCard();
            setTimeout(() => openFloatingCard(nextIndex), 500);
        });

        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const visibleIndexes = cards.map((c, i) => ({ i, visible: c.element.style.display !== 'none' }))
                .filter(c => c.visible)
                .map(c => c.i);
            const current = visibleIndexes.indexOf(currentIndex);
            const nextIndex = visibleIndexes[(current + 1) % visibleIndexes.length];
            closeFloatingCard();
            setTimeout(() => openFloatingCard(nextIndex), 500);
        });

        // Create all project cards
        projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.classList.add('card', 'col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'px-2', 'py-1', 'my-2');
            card.innerHTML = `
        <img class="card-img-top" src="${project.image}" alt="${project.title}">
        <div class="card-body">
            <h5 class="card-title">${project.title}</h5>
            <p class="card-text text-muted">${project.tags.join(', ')}</p>
            <p class="card-text description">${project.description}</p>
        </div>
        <div class="card-footer">
            <small class="text-muted">Publication date: ${project.date}</small>
        </div>`;

            card.addEventListener('click', () => {
                if (activeFloating) {
                    closeFloatingCard();
                    setTimeout(() => openFloatingCard(index), 500);
                } else {
                    openFloatingCard(index);
                }
            });

            cards.push({ element: card, tags: project.tags });
            projectList.appendChild(card);
        });

        // Initially hide arrows
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    }
}

export default MyProjects;
