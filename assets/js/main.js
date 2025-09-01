import { on, select } from './helpers.js';

(function () {
    'use strict'
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener);
    };

    const scrollto = el => {
        let elementPos = select(el).offsetTop;
        window.scrollTo({
            top: elementPos,
            behavior: 'smooth',
        });
    };

    const navbarlinksActive = () => {
        let position = window.scrollY + 200;
        select('#navbar .scrollto', true).forEach(navbarlink => {
            if (!navbarlink.hash) return;
            let section = select(navbarlink.hash);
            if (!section) return;
            if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
                navbarlink.classList.add('active');
            } else {
                navbarlink.classList.remove('active');
            }
        });
    };

    /* --- Listeners --- */

    window.addEventListener("load", navbarlinksActive);
    onscroll(document, navbarlinksActive);
    on('click', '.mobile-nav-toggle', function (e) {
        select('body').classList.toggle('mobile-nav-active');
        this.classList.toggle('bi-list');
        this.classList.toggle('bi-x');
    });
    on(
        'click',
        '.scrollto',
        function (e) {
            if (select(this.hash)) {
                e.preventDefault();
                let body = select('body');
                if (body.classList.contains('mobile-nav-active')) {
                    body.classList.remove('mobile-nav-active');
                    let navbarToggle = select('.mobile-nav-toggle');
                    navbarToggle.classList.toggle('bi-list');
                    navbarToggle.classList.toggle('bi-x');
                }
                scrollto(this.hash);
            }
        },
        true
    );

    window.addEventListener('load', () => {
        if (window.location.hash) {
            if (select(window.location.hash)) {
                scrollto(window.location.hash);
            }
        }
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
        });
    });


    let backtotop = select('.back-to-top');
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active');
            } else {
                backtotop.classList.remove('active');
            }
        };
        window.addEventListener('load', toggleBacktotop);
        onscroll(document, toggleBacktotop);
    }

    /* --- Init webcomponents --- */
    import('./components/credly.webcomponent.js').then(module => {
        const CredlyBadgeList = module.default;
        customElements.define('credly-badge-list', CredlyBadgeList);
    });
    import('./components/clock.webcomponent.js').then(module => {
        customElements.define('digital-clock', module.DigitalClock);
        customElements.define('analog-clock', module.AnalogClock);
    });
    import('./components/skillcloud.webcomponent.js').then(module => {
        const SkillCloud = module.default;
        customElements.define('skill-cloud', SkillCloud);
    });
    import('./components/project.webcomponent.js').then(module => {
        const MyProjects = module.default;
        customElements.define('my-projects-portfolio', MyProjects);
    });
    import('./components/services.webcomponent.js').then(module => {
        const Services = module.default;
        customElements.define('services-list', Services);
    });

    import('./components/blog.webcomponent.js').then(module => {
        const Blog = module.default;
        customElements.define('my-blog-system', Blog);
    });
})();
