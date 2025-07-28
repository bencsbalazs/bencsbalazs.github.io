class ServicesSection extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const src = this.getAttribute('src');
        const animation = this.getAttribute('animation') || 'fade-up';
        const delayStep = parseInt(this.getAttribute('delay-step'), 10) || 100;

        let services = [];
        try {
            const response = await fetch(src);
            services = await response.json();
        } catch (err) {
            console.error('Failed to load services JSON:', err);
            return;
        }

        const row = document.createElement('div');
        row.classList.add('row','row-cols-lg-3', 'row-cols-md-2');

        services.forEach((item, index) => {
            const col = document.createElement('div');
            col.classList.add('col', 'mb-2', 'icon-box');
            col.setAttribute('data-aos', animation);
            col.setAttribute('data-aos-delay', String(index * delayStep));

            const iconDiv = document.createElement('div');
            iconDiv.className = 'icon d-flex justify-content-center align-items-center float-start rounded-circle border border-dark transition fs-6';
            iconDiv.innerHTML = `<i class="${item.icon}"></i>`;
            col.appendChild(iconDiv);

            const h4 = document.createElement('h4');
            h4.className = 'title mb-1 fs-5 text-primary fw-bold';

            const a = document.createElement('a');
            a.href = item.link || '#';
            a.textContent = item.title;
            h4.appendChild(a);
            col.appendChild(h4);

            const p = document.createElement('p');
            p.className = 'description';
            p.textContent = item.description;
            col.appendChild(p);
            row.appendChild(col);
        });
        this.appendChild(row);
    }
}

export default ServicesSection;
