(function () {
    ('use strict');
    /* --- Helper functions --- */
    const select = (el, all = false) => {
        el = el.trim();
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return document.querySelector(el);
        }
    };

    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all);
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener));
            } else {
                selectEl.addEventListener(type, listener);
            }
        }
    };

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

    /* --- Init animations --- */

    const typed = select('.typed');
    if (typed) {
        let typed_strings = typed.getAttribute('data-typed-items');
        typed_strings = typed_strings.split(',');
        new Typed('.typed', {
            strings: typed_strings,
            loop: true,
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 2000,
        });
    }

    let skilsContent = select('.skills-content');
    if (skilsContent) {
        new Waypoint({
            element: skilsContent,
            offset: '80%',
            handler: function (direction) {
                let progress = select('.progress .progress-bar', true);
                progress.forEach(el => {
                    el.style.width = el.getAttribute('aria-valuenow') + '%';
                });
            },
        });
    }
    /* --- Init webcomponents --- */
    import('./components/credly.webcomponent.js').then(module => {
        const CredlyBadgeList = module.default;
        customElements.define('credly-badge-list', CredlyBadgeList);
    });
    import('./components/clock.webcomponent.js').then(module => {
        const DigitalClock = module.DigitalClock;
        customElements.define('digital-clock', DigitalClock);
    });
    import('./components/clock.webcomponent.js').then(module => {
        const AnalogClock = module.AnalogClock;
        customElements.define('analog-clock', AnalogClock);
    });
    import('./components/matrix.webcomponent.js').then(module => {
        const MatrixCode = module.default;
        customElements.define('matrix-code', MatrixCode);
    });
    import('./components/skillcloud.webcomponent.js').then(module => {
        const skillCloud = module.default;
        customElements.define('skill-cloud', skillCloud);
    });
    import('./components/project.webcomponent.js').then(module => {
        const MyProjects = module.default;
        customElements.define('my-projects-portfolio', MyProjects);
    });
})();
