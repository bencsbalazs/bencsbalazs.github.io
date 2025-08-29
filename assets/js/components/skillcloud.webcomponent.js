class SkillCloud extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const src = this.getAttribute('src');
        if (!src) {
            this.shadowRoot.innerHTML = `<p>Error: src attribute for skills is missing.</p>`;
            return;
        }
        try {
            const response = await fetch(src);
            const skills = await response.json();
            this.render(skills);
        } catch (error) {
            console.error('Error loading skills:', error);
            this.shadowRoot.innerHTML = `<p>Error loading skills.</p>`;
        }
    }

    render(skills) {
        const shuffledSkills = [...skills].sort(() => Math.random() - 0.5);
        const types = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css">
            <style>
                .tag-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                }
                .badge {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    padding: 0.8rem 1.2rem;
                    cursor: default;
                }
                .badge:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 10;
                    position: relative;
                }
            </style>
            <div class="tag-cloud"></div>
        `;

        const tagCloudContainer = this.shadowRoot.querySelector('.tag-cloud');

        shuffledSkills.forEach((skill, index) => {
            const tagElement = document.createElement('span');
            const baseFontSize = 0.8;
            const step = 0.25;
            const fontSize = baseFontSize + (skill.level * step);

            tagElement.className = `badge rounded-pill bg-${types[index % types.length]}`;
            tagElement.textContent = skill.text;
            tagElement.style.fontSize = `${fontSize}rem`;
            tagElement.setAttribute('data-aos', 'zoom-in');
            tagElement.setAttribute('data-aos-delay', `${index * 50}`);

            tagCloudContainer.appendChild(tagElement);
        });
    }
}

export default SkillCloud;
