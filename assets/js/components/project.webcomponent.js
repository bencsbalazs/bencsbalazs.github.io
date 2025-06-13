class MyProjects extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.loadProjects();
    }

    async loadProjects() {
        try {
            await fetch((window.location.protocol == 'http:'
                ? 'http://127.0.0.1:5500/'
                : 'https://bencsbalazs.github.io/') + 'assets/projects/projects.json')
                .then((response) => response.json())
                .then((data) => { this.renderProjects(data); })
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    renderProjects(projects) {
        this.innerHTML = `
    <style>
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
          height: 5rem;
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
    </style>
    <div class="row" id="portfolio_container"></div>`;
        const projectList = this.querySelector('#portfolio_container');
        projectList.innerHTML = '';
        let activeFloating = null;
        projects.forEach(project => {
            const card = document.createElement('div')
            card.classList.add('card', 'col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'px-2', 'my-2');
            card.innerHTML = `
        <img class="card-img-top" src="${project.image}" alt="${project.title}">
        <div class="card-body">
            <h5 class="card-title">${project.title}</h5>
            <p class="card-text text-muted">${project.tags.join(', ')}</p>
            <p class="card-text description">${project.description}</p>
            <a href="${project.link}" class="btn btn-primary">View Project</a>
        </div>
        <div class="card-footer">
            <small class="text-muted">Publication date: ${project.date}</small>
        </div>
      `;

            card.addEventListener('click', () => {
                // Close existing floating card
                if (activeFloating) {
                    activeFloating.remove();
                    activeFloating = null;
                }

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

                // Wait a tick to trigger animation
                requestAnimationFrame(() => {
                    clone.classList.add('centered');
                    setTimeout(() => {
                        clone.classList.add('grow');
                    }, 400);
                });

                // Click again to close
                clone.addEventListener('click', () => {
                    clone.classList.remove('grow');
                    setTimeout(() => {
                        clone.classList.remove('centered');
                        setTimeout(() => {
                            clone.remove();
                            activeFloating = null;
                            card.classList.remove('hidden');
                        }, 400);
                    }, 10);
                });
            });
            projectList.appendChild(card);
        });
    }
}

export default MyProjects;
