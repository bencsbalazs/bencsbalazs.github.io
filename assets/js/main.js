(function () {
  ('use strict');

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
    el.addEventListener('scroll', listener);
  };

  let navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
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
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  const scrollto = (el) => {
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth',
    });
  };

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
  });

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
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      },
    });
  }

  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  });

  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
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

  window.addEventListener('load', () => {
    // --- Element rendering ---
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
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
      element.innerHTML = unescape(text);
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

  const listView = (data, tableOfContents) => {
    for (let key in data) {
      let link = document.createElement('a');
      let text = document.createTextNode(data[key].title);
      link.appendChild(text);
      link.href = '#' + key;
      link.classList.add('blogLink');
      link.title = data[key].description;
      document.getElementById(tableOfContents).appendChild(link);
    }
    return true;
  };
  const treeView = (data, tableOfContents) => {
    const tocTitle = document.createElement('h3');
    let tableOfContentsList = document.createElement('ul');
    tableOfContentsList.setAttribute('id', 'tableOfContentTree');
    document.getElementById(tableOfContents).appendChild(tocTitle);
    document.querySelector('#tableOfContents h3').textContent = 'Articles grouped by date';
    document.getElementById(tableOfContents).appendChild(tableOfContentsList);
    // Key-s must be in the format: dd-mm-yyyy-TITLE
    for (let key in data) {
      const dates = key.split('-');
      // If post's year doesn't exist in the table of contents list, then create it
      if (!document.getElementById(dates[0])) {
        let parent = document.createElement('li');
        parent.setAttribute('id', dates[0]);
        let arrow = document.createElement('span');
        arrow.classList.add('caret');
        let text = document.createTextNode(dates[0]);
        arrow.appendChild(text);
        arrow.addEventListener('click', function () {
          this.parentElement.querySelector('.nested').classList.toggle('active');
          this.classList.toggle('caret-down');
        });
        parent.appendChild(arrow);
        // Add the post container list
        let nestedList = document.createElement('ul');
        nestedList.classList.add('nested');
        parent.appendChild(nestedList);
        // Add list element to the container
        document.getElementById('tableOfContentTree').appendChild(parent);
      }
      let item = document.createElement('li');
      let link = document.createElement('a');
      let text = document.createTextNode(data[key].title);
      link.appendChild(text);
      link.href = '#' + key;
      link.classList.add('blogLink');
      item.appendChild(link);
      document.getElementById(dates[0]).getElementsByClassName('nested')[0].appendChild(item);
    }
    return true;
  };
  const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    return true;
  };

  const getCookie = (cname) => {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };

  const checkCookie = (name) => {
    return getCookie(name) != '';
  };

  async function buildBlog() {
    domain =
      window.location.protocol == 'http:'
        ? 'http://127.0.0.1:5500/'
        : 'https://bencsbalazs.github.io/';
    blogData = await fetch(domain + 'assets/blog/personal.json')
      .then((response) => response.json())
      .then((data) => {
        layout = 'tree';
        switch (layout) {
          case 'list':
            listView(data, 'tableOfContents');
            break;
          case 'tree':
            treeView(data, 'tableOfContents');
            break;
        }
        return data;
      })
      .then((data) => {
        on(
          'click',
          '.blogLink',
          function (e) {
            e.preventDefault();
            removeAllClass('.blogLink', 'selected');
            document.getElementById('blogContent').innerHTML = '';
            this.classList.add('selected');
            addElement('h3', 'blogContent', 'title', data[e.target.hash.substr(1)].title);
            addElement('div', 'blogContent', 'date', data[e.target.hash.substr(1)].date);
            fetch(domain + 'assets/blog/posts/' + e.target.hash.substr(1) + '.md')
              .then((post) => post.text())
              .then((text) => {
                addElement('article', 'blogContent', false, marked.parse(text), true);
              });
          },
          true
        );
      });
    document.querySelector('#tableOfContents a').click();
  }

  window.addEventListener('DOMContentLoaded', function () {
    if (checkCookie('showBlog')) {
      select('#showBlog').checked = true;
    } else {
      select('.blog').setAttribute('style', 'display: none;');
    }

    on('change', '#showBlog', function () {
      if (this.checked) {
        select('.blog').setAttribute('style', 'display: block;');
        buildBlog();
      } else {
        select('.blog').setAttribute('style', 'display: none;');
      }
    });
  });
})();
