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
                : 'https://bencsbalazs.github.io/') + 'assets/jsons/projects.json')
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
        #portfolio_container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: stretch;
        }
        .card {
          transition: all 0.4s ease;
          cursor: pointer;
          width: calc((100% - 1em) / 3);
        margin-right: 0.5em;
        }
        .card:nth-child(3n){
            margin-right: 0;
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
        .floating-card img {
            display: block;
        }
        .card img {
            display: none;
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
        .closeButton {
        position: absolute;
        top: 2%;
        right: 2%;
        font-size: 2em;
        z-index: 999;
        cursor: pointer;
        }
          @media (max-width: 800px) {
            .floating-card.grow { width: 80vw !important;}
          }
      </style>

      <div id="tag_filter"></div>
      <div class="row" id="portfolio_container"></div>
      <div class="arrow left">&#11207;</div>
      <div class="arrow right">&#11208;</div>
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
            button.classList.add("m-1", "p-1", "btn-outline-primary")
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

            const closeButton = document.createElement("div");
            closeButton.classList.add('closeButton');
            closeButton.textContent = "X"
            closeButton.addEventListener('click', () => {
                closeFloatingCard();
            });
            const card = cards[index].element;
            const rect = card.getBoundingClientRect();
            const clone = card.cloneNode(true);
            card.classList.add('hidden');
            clone.classList.remove(...card.classList);
            clone.classList.add('floating-card');
            clone.appendChild(closeButton);
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


        };

        const closeFloatingCard = () => {
            if (!activeFloating) return;

            const originalCard = cards[currentIndex].element;
            const clone = activeFloating;
            document.querySelector('.closeButton').remove()
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

        projectList.classList.add("row-cols-md-3", "raw-cols-sm-2", "raw-cols-1")
        // Create all project cards
        projects.forEach((project, index) => {
            const card = document.createElement('div');
            let action = ""
            let text = ""
            let tagList = ""
            card.classList.add('card');
            if (!project.link) {
                action = "disabled",
                text="Internal project"
            } else {
                action = "href='"+project.link+"'",
                text="Repository"
            }
            project.tags.forEach((tag) => {
                tagList += "<span class='badge rounded-pill bg-primary mx-1'>" + tag + "</span>"
            })
            card.innerHTML = `
        <img class="card-img-top" src="${project.image}" alt="${project.title}">
        <div class="card-body">
            <h5 class="card-title">${project.title}</h5>
            <div class="tagList py-1">${tagList}</div>
            <p class="card-text description">${project.description}</p>
        </div>
        <div class="card-footer">
            <a class="btn btn-primary btn-small" ${action}>${text}</a><br>
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
