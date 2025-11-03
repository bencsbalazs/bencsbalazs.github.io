import { on, select } from './helpers.js';

(function () {
    'use strict';
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener);
    };

    const scrollto = el => {
        const elementPos = select(el).offsetTop;
        window.scrollTo({
            top: elementPos,
            behavior: 'smooth',
        });
    };

    const navbarlinksActive = () => {
        const position = window.scrollY + 200;
        for (let navbarlink of select('#navbar .scrollto', true)) {
            if (!navbarlink.hash) return;
            const section = select(navbarlink.hash);
            if (!section) return;
            if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
                navbarlink.classList.add('active');
            } else {
                navbarlink.classList.remove('active');
            }
        };
    };

    const toggleMobileNav = () => {
        select('body').classList.toggle('mobile-nav-active');
        const navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
    };

    /**
     * Dynamically imports and defines web components.
     * @param {object} definition - The component definition.
     * @param {string} definition.path - The path to the component module.
     * @param {object} definition.components - A map of tag names to export names.
     */
    const defineWebComponents = ({ path, components }) => {
        import(path)
            .then(module => {
                for (const [tagName, exportName] of Object.entries(components)) {
                    const component = module[exportName];
                    if (component) {
                        customElements.define(tagName, component);
                    } else {
                        console.error(`Component with export name '${exportName}' not found in ${path}`);
                    }
                }
            })
            .catch(err => console.error(`Failed to load module from ${path}`, err));
    };

    /* --- Event Listeners --- */

    onscroll(document, navbarlinksActive);

    on('click', '.mobile-nav-toggle', toggleMobileNav);

    on(
        'click',
        '.scrollto',
        function (e) {
            if (select(this.hash)) {
                e.preventDefault();
                if (select('body').classList.contains('mobile-nav-active')) {
                    toggleMobileNav();
                }
                scrollto(this.hash);
            }
        },
        true
    );

    window.addEventListener('load', () => {
        navbarlinksActive();

        document.querySelector('animated-avatar').addEventListener('avatar-click', () => {
            console.log('Az oldalamon észleltem az avatar kattintást!');
            // TODO: Ide jöhet a Gemini API indítása
        });

        if (globalThis.location.hash && select(globalThis.location.hash)) {
            scrollto(globalThis.location.hash);
        }

        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
        });
    });

    const componentsToRegister = [
        { path: './components/credly.webcomponent.js', components: { 'credly-badge-list': 'default' } },
        {
            path: './components/clock.webcomponent.js',
            components: { 'digital-clock': 'DigitalClock', 'analog-clock': 'AnalogClock' },
        },
        { path: './components/skillcloud.webcomponent.js', components: { 'skill-cloud': 'default' } },
        { path: './components/project.webcomponent.js', components: { 'my-projects-portfolio': 'default' } },
        { path: './components/feedbacks.webcomponent.js', components: { 'show-feedbacks': 'default' } },
        { path: './components/avatar.webcomponent.js', components: { 'animated-avatar': 'default' } },

    ];

    for (const component of componentsToRegister) {
        defineWebComponents(component);
    }
})();
