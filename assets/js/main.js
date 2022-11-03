(function () {
    ("use strict");

    /* ------------------------
       --- Helper functions ---
       ------------------------ */

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
                selectEl.forEach((e) => e.addEventListener(type, listener));
            } else {
                selectEl.addEventListener(type, listener);
            }
        }
    };

    const onscroll = (el, listener) => {
        el.addEventListener("scroll", listener);
    };

    let navbarlinks = select("#navbar .scrollto", true);
    const navbarlinksActive = () => {
        let position = window.scrollY + 200;
        navbarlinks.forEach((navbarlink) => {
            if (!navbarlink.hash) return;
            let section = select(navbarlink.hash);
            if (!section) return;
            if (
                position >= section.offsetTop &&
                position <= section.offsetTop + section.offsetHeight
            ) {
                navbarlink.classList.add("active");
            } else {
                navbarlink.classList.remove("active");
            }
        });
    };
    window.addEventListener("load", navbarlinksActive);
    onscroll(document, navbarlinksActive);

    const scrollto = (el) => {
        let elementPos = select(el).offsetTop;
        window.scrollTo({
            top: elementPos,
            behavior: "smooth",
        });
    };

    let backtotop = select(".back-to-top");
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add("active");
            } else {
                backtotop.classList.remove("active");
            }
        };
        window.addEventListener("load", toggleBacktotop);
        onscroll(document, toggleBacktotop);
    }

    on("click", ".mobile-nav-toggle", function (e) {
        select("body").classList.toggle("mobile-nav-active");
        this.classList.toggle("bi-list");
        this.classList.toggle("bi-x");
    });

    on(
        "click",
        ".scrollto",
        function (e) {
            if (select(this.hash)) {
                e.preventDefault();

                let body = select("body");
                if (body.classList.contains("mobile-nav-active")) {
                    body.classList.remove("mobile-nav-active");
                    let navbarToggle = select(".mobile-nav-toggle");
                    navbarToggle.classList.toggle("bi-list");
                    navbarToggle.classList.toggle("bi-x");
                }
                scrollto(this.hash);
            }
        },
        true
    );

    window.addEventListener("load", () => {
        if (window.location.hash) {
            if (select(window.location.hash)) {
                scrollto(window.location.hash);
            }
        }
        let portfolioContainer = select(".portfolio-container");
        if (portfolioContainer) {
            let portfolioIsotope = new Isotope(portfolioContainer, {
                itemSelector: ".portfolio-item",
            });

            let portfolioFilters = select("#portfolio-flters li", true);

            on(
                "click",
                "#portfolio-flters li",
                function (e) {
                    e.preventDefault();
                    portfolioFilters.forEach(function (el) {
                        el.classList.remove("filter-active");
                    });
                    this.classList.add("filter-active");

                    portfolioIsotope.arrange({
                        filter: this.getAttribute("data-filter"),
                    });
                    portfolioIsotope.on("arrangeComplete", function () {
                        AOS.refresh();
                    });
                },
                true
            );
        }
    });

    const typed = select(".typed");
    if (typed) {
        let typed_strings = typed.getAttribute("data-typed-items");
        typed_strings = typed_strings.split(",");
        new Typed(".typed", {
            strings: typed_strings,
            loop: true,
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 2000,
        });
    }

    let skilsContent = select(".skills-content");
    if (skilsContent) {
        new Waypoint({
            element: skilsContent,
            offset: "80%",
            handler: function (direction) {
                let progress = select(".progress .progress-bar", true);
                progress.forEach((el) => {
                    el.style.width = el.getAttribute("aria-valuenow") + "%";
                });
            },
        });
    }

    const portfolioLightbox = GLightbox({
        selector: ".portfolio-lightbox",
    });

    new Swiper(".portfolio-details-slider", {
        speed: 400,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true,
        },
    });

    new Swiper(".testimonials-slider", {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        slidesPerView: "auto",
        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20,
            },

            1200: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
        },
    });

    /* ------------------------
       --- Matrix animation ---
       ------------------------ */

    const canvas = document.getElementById("canv");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const cols = Math.floor(w / 20) + 1;
    const ypos = Array(cols).fill(0);

    const matrix = () => {
        ctx.fillStyle = "#474747";
        ctx.fillRect(0, 0, w, h);

        // Set color to green and font to 15pt monospace in the drawing context
        ctx.fillStyle = "#0f0";
        ctx.font = "20pt monospace";

        // for each column put a random character at the end
        ypos.forEach((y, ind) => {
            // generate a random character
            const text = String.fromCharCode(Math.random() * 128);

            // x coordinate of the column, y coordinate is already given
            const x = ind * 20;
            // render the character at (x, y)
            ctx.fillText(text, x, y);

            // randomly reset the end of the column if it's at least 100px high
            if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
            else ypos[ind] = y + 20;
        });
    };

    window.addEventListener("load", () => {
        // --- Element rendering ---
        AOS.init({
            duration: 1000,
            easing: "ease-in-out",
            once: true,
            mirror: false,
        });

        // --- Start matrix ---
        setInterval(matrix, 100);
    });

    /* ------------------------
       ---- Blog functions ----
       ------------------------ */

    const addElement = (what, where, style, text, html = false) => {
        let element = document.createElement(what);
        if (!html) {
            let textNode = document.createTextNode(text);
            element.appendChild(textNode);
        } else {
            element.innerHTML = text;
        }
        if (style) {
            element.classList.add(style);
        }

        document.getElementById(where).appendChild(element);
    };

    const removeAllClass = (where, what) => {
        [].forEach.call(select(where, (all = true)), function (el) {
            el.classList.remove(what);
        });
    };

    window.addEventListener("DOMContentLoaded", function () {
        async function buildBlog() {
            blogData = await fetch(
                "https://bencsbalazs.github.io/assets/blog/blog.json"
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let key in data) {
                        let link = document.createElement("a");
                        let text = document.createTextNode(data[key].title);
                        link.appendChild(text);
                        link.href = "#" + key;
                        link.classList.add("blogLink");
                        document
                            .getElementById("tableOfContents")
                            .appendChild(link);
                    }
                    return data;
                })
                .then((data) => {
                    on(
                        "click",
                        ".blogLink",
                        function (e) {
                            e.preventDefault();
                            document.getElementById("blogContent").innerHTML =
                                "";

                            addElement(
                                "h3",
                                "blogContent",
                                "title",
                                data[e.target.hash.substr(1)].title
                            );
                            addElement(
                                "article",
                                "blogContent",
                                false,
                                data[e.target.hash.substr(1)].text,
                                true
                            );
                        },
                        true
                    );
                });
        }
        buildBlog();
    });
})();
