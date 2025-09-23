class PageHeaderFooter extends HTMLElement {

  static get _socialLinkData() {
    return [
      { type: 'facebook', icon: 'bi-facebook', urlAttribute: 'https://www.facebook.com/balazs.bencs.9', title: 'Me on Facebook' },
      { type: 'github', icon: 'bi-github', urlAttribute: 'https://github.com/bencsbalazs', title: 'Me on Github' },
      { type: 'instagram', icon: 'bi-instagram', urlAttribute: 'https://www.instagram.com/bencsbalazs/', title: 'Me on Instagram' },
      { type: 'linkedin', icon: 'bi-linkedin', urlAttribute: 'https://www.linkedin.com/in/bencsbalazs/', title: 'Me on Linkedin' },
      { type: 'blogger', icon: 'bi-journals', urlAttribute: 'https://balazsbencs.blogspot.com/', title: 'Me on Blogger' }
    ];
  }

  get _socialLinks() {
    return PageHeaderFooter._socialLinkData
      .map(linkData => {
        const url = linkData.urlAttribute;
        if (url) {
          return `
              <a href="${url}" title="${linkData.title}" target="_blank" class="nav-link mx-1 ${linkData.type}">
                  <i class="bi ${linkData.icon} text-white"></i>
              </a>
          `;
        }
        return '';
      })
      .join('');
  }

  get _headerTemplate() {
    const homeText = this.getAttribute('home-text') || '';

    return `
            <nav
        class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="/app/index.html">Contents</a>
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/">
                            <i class="bi bi-house-door"></i> Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/app/index.html">
                            <i class="bi bi-collection"></i> Learning & Well-being
                        </a>
                    </li>
                </ul>
                <h4 class="me-auto mt-2 text-white">${homeText}</h3>
                <div class="navbar-nav social-links d-flex flex-row">      
                    ${this._socialLinks}
                </div>
            </div>
          </div>
        </nav>
        
        `;
  }

  get _footerTemplate() {
    const copyrightText = this.getAttribute('copyright-text') || '&copy; Balázs Bencs 2009-' + new Date().getFullYear();
    return `
            <style>
                :host { display: block; }
            </style>
            <footer class="container-fluid bg-dark text-white">
                <div class="row">
                    <div class="col text-center">${copyrightText}</div>
                </div>
            </footer>
        `;
  }

  connectedCallback() {
    const type = this.getAttribute('type');

    if (type === 'header') {
      this.innerHTML = this._headerTemplate;
    } else if (type === 'footer') {
      this.innerHTML = this._footerTemplate;
    } else {
      console.error('frame-component requires a "type" attribute ("header" or "footer").');
      this.remove();
    }
  }
}

customElements.define("frame-component", PageHeaderFooter);