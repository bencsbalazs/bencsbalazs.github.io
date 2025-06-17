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
        row.className = 'row';

        services.forEach((item, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 icon-box';
            col.setAttribute('data-aos', animation);
            col.setAttribute('data-aos-delay', String(index * delayStep));
            const iconDiv = document.createElement('div');
            iconDiv.className = 'icon';
            iconDiv.innerHTML = `<i class="${item.icon}"></i>`;
            col.appendChild(iconDiv);
            const h4 = document.createElement('h4');
            h4.className = 'title';
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
