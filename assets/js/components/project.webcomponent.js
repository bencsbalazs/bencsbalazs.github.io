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
    .card.selected {
    transform: scale(2);}
    </style>
    <div class="row" id="portfolio_container"></div>`;
    const projectList = this.querySelector('#portfolio_container');
    projectList.innerHTML = '';
    projects.forEach(project => {
        const card = document.createElement('div')
        card.classList.add('card', 'col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'px-2', 'my-2');
        card.innerHTML = `
        <img class="card-img-top" src="${project.image}" alt="${project.title}">
        <div class="card-body">
            <h5 class="card-title">${project.title}</h5>
            <p class="card-text text-muted">${project.tags.join(', ')}</p>
            <p class="card-text">${project.description}</p>
            <a href="${project.link}" class="btn btn-primary">View Project</a>
        </div>
        <div class="card-footer">
            <small class="text-muted">Publication date: ${project.date}</small>
        </div>
      `;
    card.addEventListener('click', () => {card.classList.toggle('selected')})
      projectList.appendChild(card);
    });
  }
}

export default MyProjects;
