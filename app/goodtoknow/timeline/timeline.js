class TimelineComponent extends HTMLElement {
  constructor() {
    super();
  }

  loadInventionsData = async () => {
    const src = this.getAttribute("src") || '/app/goodtoknow/timeline/inventions.json';
    try {
      await fetch(
        (window.location.protocol === 'http:' ? 'http://127.0.0.1:5500/' : 'https://bencsbalazs.github.io/') +
          src
      )
      .then((response) => response.json())
      .then(data => {
          this.drawTimeline(data);
        });
    } catch (error) {
      console.error('Error loading inventions:', error);
    }
  };

  drawTimeline = inventions => {
    inventions.forEach(item => {
      const side = item.country === 'sweden' ? 'left' : 'right';
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('timeline-item', side);
      cardWrapper.setAttribute('data-aos', side === 'left' ? 'fade-right' : 'fade-left');

      const card = document.createElement('div');
      card.classList.add('card', item.country, 'shadow-sm', 'p-3');

      const cardTitle = document.createElement('h5');
      cardTitle.classList.add('fw-bold', 'mb-1');
      cardTitle.textContent = item.title;

      const cardSub = document.createElement('h6');
      cardSub.classList.add('text-muted', 'mb-2');
      cardSub.textContent = `${item.inventor} – ${item.year}`;

      const cardText = document.createElement('p');
      cardText.classList.add('mb-0');
      cardText.textContent = item.description;

      card.appendChild(cardTitle);
      card.appendChild(cardSub);
      card.appendChild(cardText);
      cardWrapper.appendChild(card);
      document.querySelector('.timeline').appendChild(cardWrapper);
    });
  };

  async connectedCallback() {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'timeline.css';
    const container = document.createElement('div');
    container.classList.add('container', 'py-5');
    const timeline = document.createElement('div');
    timeline.classList.add('timeline');
    container.appendChild(timeline);
    this.append(styleLink, container);
    this.loadInventionsData();
    // Load AOS JS in light DOM
    if (!window.AOS) {
      const aosScript = document.createElement('script');
      aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
      document.body.appendChild(aosScript);
      aosScript.onload = () => AOS.init();
    } else {
      AOS.init();
    }
  }
}

customElements.define('timeline-component', TimelineComponent);
