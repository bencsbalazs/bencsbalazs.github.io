class LoadResources extends HTMLElement {
    connectedCallback() {
        this.addMeta('charset', 'utf-8');
        this.addMeta('viewport', 'width=device-width, initial-scale=1.0');
        this.addTitle("Balázs Bencs' portfolio");
        this.addMeta('og:title', 'Balázs Bencs — Senior Full-Stack Engineer', 'property');
        this.addMeta('og:description', 'Portfolio, open-source work and services of Balázs Bencs.', 'property');
        this.addMeta('og:image', 'https://bencsbalazs.github.io/og-cover.png', 'property');
        this.addMeta('og:url', 'https://bencsbalazs.github.io', 'property');
        this.addMeta('og:type', 'website', 'property');
        this.addMeta('twitter:card', 'summary_large_image');
        this.addMeta('keywords', 'Balázs Bencs, developer, engineer');
        this.addLink('/assets/img/favicon.png', 'icon');
        this.addLink('/assets/img/apple-touch-icon.png', 'apple-touch-icon');
        this.addLink('/assets/vendor/aos/aos.css', 'stylesheet');
        this.addLink('/assets/vendor/bootstrap/css/bootstrap.min.css', 'stylesheet');
        this.addLink('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', 'stylesheet');
        this.addScript('/assets/vendor/aos/aos.js');
        this.addScript('/assets/vendor/bootstrap/js/bootstrap.bundle.min.js');
        this.addScript('/assets/vendor/aos/aos.js', true, () => {
            AOS.init();
        });

    }

    addMeta(name, content, property = 'name') {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute(property, name);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
    }

    addTitle(text) {
        const titleTag = document.createElement('title');
        titleTag.textContent = text;
        document.head.appendChild(titleTag);
    }

    addLink(href, rel) {
        const linkTag = document.createElement('link');
        linkTag.setAttribute('href', href);
        linkTag.setAttribute('rel', rel);
        document.head.appendChild(linkTag);
    }

    addScript(src, async = false, callback = null) {
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', src);
        if (async) {
            scriptTag.async = true;
        }
        if (callback && typeof callback === 'function') {
            scriptTag.addEventListener('load', callback);
        }
        document.head.appendChild(scriptTag);
    }
}

customElements.define('load-resources', LoadResources);