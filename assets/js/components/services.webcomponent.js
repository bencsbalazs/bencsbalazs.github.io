/**
 * @class ServicesSection
 * @description A web component that displays a section of services from a JSON source, styled with Bootstrap 5.
 * 
 * @property {string} src - The URL to the JSON file containing the services data.
 * @property {string} [animation='fade-up'] - The AOS animation type to apply to each service item.
 * @property {number} [delay-step=100] - The delay in milliseconds between each service item's animation.
 */
class ServicesSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        try {
            const services = await this.fetchServices();
            this.render(services);
        } catch (error) {
            console.error('Failed to render services section:', error);
            this.shadowRoot.innerHTML = `<p class="text-danger text-center">Failed to load services. Please try again later.</p>`;
        }
    }

    /**
     * @description Fetches the services data from the JSON source.
     * @returns {Promise<Array>} A promise that resolves to an array of service objects.
     */
    async fetchServices() {
        const src = this.getAttribute('src');
        if (!src) {
            throw new Error('The "src" attribute is required.');
        }

        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * @description Renders the services section using Bootstrap 5 classes.
     * @param {Array} services - An array of service objects.
     */
    render(services) {
        const animation = this.getAttribute('animation') || 'fade-up';
        const delayStep = parseInt(this.getAttribute('delay-step'), 10) || 100;

        const servicesHTML = services.map((service, index) => this.createServiceItemHTML(service, animation, index * delayStep)).join('');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../../vendor/bootstrap/css/bootstrap.min.css">
            <style>
                .icon-box {
                    padding: 20px;
                    transition: all 0.3s ease-in-out;
                }
                .icon {
                    width: 64px;
                    height: 64px;
                }
                .title a {
                    color: var(--bs-primary, #0d6efd);
                }
                .description {
                    line-height: 24px;
                    font-size: 14px;
                }
            </style>
            <div class="row">
                ${servicesHTML}
            </div>
        `;
    }

    /**
     * @description Creates the HTML for a single service item using Bootstrap 5 classes.
     * @param {object} service - The service object.
     * @param {string} animation - The AOS animation type.
     * @param {number} delay - The animation delay.
     * @returns {string} The HTML string for the service item.
     */
    createServiceItemHTML(service, animation, delay) {
        const { icon, title, link = '#', description } = service;
        return `
            <div class="col-lg-4 col-md-6 d-flex align-items-stretch mb-4" data-aos="${animation}" data-aos-delay="${delay}">
                <div class="icon-box w-100 d-flex flex-column">
                    <div class="d-flex align-items-center mb-3">
                        <div class="icon flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle border border-dark me-3">
                            <i class="${icon} fs-4"></i>
                        </div>
                        <h4 class="title fw-bold mb-0">
                            <a href="${link}" class="text-decoration-none">${title}</a>
                        </h4>
                    </div>
                    <p class="description flex-grow-1">${description}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('services-section', ServicesSection);
export default ServicesSection;
