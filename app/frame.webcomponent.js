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
              <a href="${url}" title="${linkData.title}" target="_blank" class="nav-link ${linkData.type}">
                  <i class="bi ${linkData.icon} text-white"></i>
              </a>
          `;
        }
        return '';
      })
      .join('');
  }

  get _headerTemplate() {
    const profileImgSrc = this.getAttribute('profile-img-src') || '/assets/img/profile-img.jpg';
    const profileImgAlt = this.getAttribute('profile-img-alt') || "Balazs' profile";
    const homeText = this.getAttribute('home-text') || '';

    return `
            <style>
                :host { display: block; }
            </style>
            <nav class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
                <div class="container">
                    <div class="col-6 d-flex flex-row justify-content-start">
                        <img src="${profileImgSrc}" class="img-fluid rounded-circle" alt="${profileImgAlt}" style="width: 2rem" />
                        <h4 class="ms-2 mt-1 text-white">${homeText}</h4>
                        <a class="nav-link text-white" title="Click to go back to home." href="/">
                            <i class="bi bi-house-door"></i> Home
                        </a>
                        <a class="nav-link text-white" href="/app/index.html">
                            <i class="bi bi-collection"></i> Content collection
                        </a>
                    </div>
                    
                    <div class="col-6 d-flex flex-row justify-content-end">
                        ${this._socialLinks}
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