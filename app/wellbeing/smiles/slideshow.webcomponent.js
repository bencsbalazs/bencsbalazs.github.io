class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.images = [];
    this.swiper = null;
    this.adjustHeight = this.adjustHeight.bind(this);
  }

  async connectedCallback() {
    await this.loadImages();
    this.render();
    this.initSlider();
    setTimeout(this.adjustHeight, 100);
    window.addEventListener('resize', this.adjustHeight);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.adjustHeight);
  }

  adjustHeight() {
    const navbar = document.querySelector('frame-component[type="header"]');
    const footer = document.querySelector('frame-component[type="footer"]');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const footerHeight = footer ? footer.offsetHeight : 0;

    document.querySelector('.swiper').style.height = `calc(100vh - ${navbarHeight}px - ${footerHeight}px)`;
  }

  async loadImages() {
    this.images = [];
    for (let i = 1; i <= 15; i++) {
      this.images.push(`./${i}.webp`);
    }

    // Fisher-Yates shuffle
    for (let i = this.images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.images[i], this.images[j]] = [this.images[j], this.images[i]];
    }

    this.slides = this.images.map((src, index) => `
            <div class="swiper-slide">
              <img src="${src}">
            </div>
          `).join('')
  }

  render() {
    this.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100vh; 
      }
      .swiper {
        width: 100%;
        height: 100%;
      }
      .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .swiper-slide img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    </style>
    <div class="swiper">
      <div class="swiper-wrapper">
        ${this.slides}
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-scrollbar"></div>
    </div>
    `;
  }

  initSlider() {
    const swiperEl = this.querySelector('.swiper');
    if (swiperEl) {
      this.swiper = new Swiper(swiperEl, {
        direction: 'horizontal',
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: this.querySelector('.swiper-pagination'),
        },
        navigation: {
          nextEl: this.querySelector('.swiper-button-next'),
          prevEl: this.querySelector('.swiper-button-prev'),
        },
        scrollbar: {
          el: this.querySelector('.swiper-scrollbar'),
        },
      });
    }
  }
}

customElements.define('slideshow-component', SlideshowComponent);