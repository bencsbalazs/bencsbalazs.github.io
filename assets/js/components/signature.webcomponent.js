import { LitElement, html, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3.2.0/+esm';
import { map } from 'https://cdn.jsdelivr.net/npm/lit@3.2.0/directives/map.js/+esm';

class BlsSignature extends LitElement {

    static get properties() {
        return {
            appTitle: { type: String, attribute: 'app-title' },
            copyright: { type: String },
            _assetsLoaded: { state: true }
        };
    }

    constructor() {
        super();
        this.appTitle = '';
        this.copyright = `&copy; Balázs Bencs 2009-${new Date().getFullYear()}`;
        this._assetsLoaded = false;
    }

    static get _socialLinkData() {
        return [
            { type: 'facebook', icon: 'bi-facebook', url: 'https://www.facebook.com/balazs.bencs.9', title: 'Me on Facebook' },
            { type: 'github', icon: 'bi-github', url: 'https://github.com/bencsbalazs', title: 'Me on Github' },
            { type: 'instagram', icon: 'bi-instagram', url: 'https://www.instagram.com/bencsbalazs/', title: 'Me on Instagram' },
            { type: 'linkedin', icon: 'bi-linkedin', url: 'https://www.linkedin.com/in/bencsbalazs/', title: 'Me on Linkedin' },
            { type: 'blogger', icon: 'bi-journals', url: 'https://balazsbencs.blogspot.com/', title: 'Me on Blogger' }
        ];
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        this._initAssets();
    }

    async _initAssets() {
        const resources = {
            css: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
            icons: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
            js: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
        };

        try {
            await Promise.all([
                this._loadResource('link', resources.css),
                this._loadResource('link', resources.icons),
                this._loadResource('script', resources.js)
            ]);

            console.log('Bootstrap assets loaded. Rendering Lit menu...');
            this._assetsLoaded = true;

        } catch (error) {
            console.error('Hiba történt a Bootstrap betöltése közben:', error);
        }
    }

    _loadResource(type, url) {
        return new Promise((resolve, reject) => {
            const selector = type === 'link' ? `link[href="${url}"]` : `script[src="${url}"]`;
            if (document.querySelector(selector)) return resolve();

            const el = document.createElement(type);
            if (type === 'link') {
                el.rel = 'stylesheet';
                el.href = url;
            } else {
                el.src = url;
                el.async = true;
            }

            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`Load error: ${url}`));
            document.head.appendChild(el);
        });
    }

    render() {
        if (!this._assetsLoaded) return nothing;
        return html`
      <nav class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
        <div class="container-fluid">
          <h2 class="navbar-brand my-auto">${this.appTitle}</h2>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" 
                  aria-expanded="false" aria-label="Toggle navigation">
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
                  <i class="bi bi-collection"></i> All applications
                </a>
              </li>
            </ul>
            
            <div class="navbar-nav social-links d-flex flex-row">
              ${map(BlsSignature._socialLinkData, (link) => html`
                <a href="${link.url}" title="${link.title}" target="_blank" class="nav-link mx-1 ${link.type}">
                  <i class="bi ${link.icon} text-white"></i>
                </a>
              `)}
            </div>
            
            <span class="nav-item text-white my-auto ms-3">
              <span .innerHTML="${this.copyright}"></span>
            </span>
          </div>
        </div>
      </nav>
    `;
    }
}

customElements.define('bls-signature', BlsSignature);