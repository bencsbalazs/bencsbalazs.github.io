class DigitalClock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.width = this.getAttribute('width') || '200px';
        this.height = this.getAttribute('height') || '100px';
        this.render();
    }

    connectedCallback() {
        this.updateTime();
        this.interval = setInterval(() => this.updateTime(), 1000);
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        this.shadowRoot.querySelector('#clock').textContent = `${hours}:${minutes}:${seconds}`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            @import url('https://fonts.cdnfonts.com/css/digital-numbers');
                .clock-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2em;
                    font-family: 'Digital Numbers', sans-serif;
                    background: black;
                    color: white;
                    border-radius: 10px;
                    width: ${this.width};
                    height: ${this.height};
                }
            </style>
            <div class="clock-container" id="clock">--:--:--</div>
        `;
    }
}

customElements.define('digital-clock', DigitalClock);


/* ---------------------------
   --- Badges webcomponent ---
   --------------------------- */

class CredlyBadgeList extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const badgeIds = this.getAttribute("badge-ids")?.split(",") || [];
        const container = document.createElement("div");
        container.classList.add("col-lg-4","col-md-6","d-flex","align-items-stretch");
        badgeIds.forEach((badgeId) => {
            const badgeDiv = document.createElement("div");
            badgeDiv.setAttribute("data-iframe-width", "200");
            badgeDiv.setAttribute("data-iframe-height", "200");
            badgeDiv.setAttribute("data-share-badge-id", badgeId.trim());
            badgeDiv.setAttribute("data-share-badge-host", "https://www.credly.com");
            container.appendChild(badgeDiv);
        });
        this.loadScript();
        this.appendChild(container);
    }
    loadScript() {
        if (!document.querySelector('script[src="https://cdn.credly.com/assets/utilities/embed.js"]')) {
            const script = document.createElement("script");
            script.src = "https://cdn.credly.com/assets/utilities/embed.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }
}

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
        // --- Start matrix ---
        setInterval(matrix, 100);
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

    /* ------------------------
       --- Matrix animation ---
       ------------------------ */

    const canvas = document.getElementById('canv');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const cols = Math.floor(w / 14) + 1;
    const ypos = Array(cols).fill(0);

    const matrix = () => {
        ctx.fillStyle = '#474747';
        ctx.fillRect(0, 0, w, h);

        // Set color to green and font to 15pt monospace in the drawing context
        ctx.fillStyle = '#0f0';
        ctx.font = '14pt monospace';

        // for each column put a random character at the end
        ypos.forEach((y, ind) => {
            // generate a random character
            const text = String.fromCharCode(Math.random() * 128);

            // x coordinate of the column, y coordinate is already given
            const x = ind * 14;
            // render the character at (x, y)
            ctx.fillText(text, x, y);

            // randomly reset the end of the column if it's at least 100px high
            if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
            else ypos[ind] = y + 14;
        });
    };
    /* --- Init webcomponents --- */
    customElements.define("credly-badge-list", CredlyBadgeList);
})();
