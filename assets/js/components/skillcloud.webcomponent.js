class SkillCloud extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.bootstrapCSS = document.createElement("link")
        this.bootstrapCSS.setAttribute("rel", "stylesheet")
        this.bootstrapCSS.setAttribute("href", "/assets/vendor/bootstrap/css/bootstrap.min.css");
        this.bootstrapJS = document.createElement("script")
        this.bootstrapJS.setAttribute("src", "/assets/vendor/bootstrap/js/bootstrap.bundle.min.js");
    }

    async connectedCallback() {
        const src = this.getAttribute('src');
        if (!src) {
            this.shadowRoot.innerHTML = `<p>Error: src attribute for skills is missing.</p>`;
            return;
        }
        try {
            const response = await fetch(src);
            const skillData = await response.json();
            const type = this.getAttribute("type")
            if (!type || type == "cloud") {
                let allSkill = []
                for (const [key, value] of Object.entries(skillData)) {
                    allSkill.push(...value.skills)
                }
                this.loadSkillsAsCloud(allSkill);
            } else {
                this.loadFullStackSkills(skillData);
            }
        } catch (error) {
            console.error('Error loading skills:', error);
            this.shadowRoot.innerHTML = `<p>Error loading skills.</p>`;
        }
    }

    loadSkillsAsCloud(skills) {
        const shuffledSkills = [...skills].sort(() => Math.random() - 0.5);
        const types = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
        this.shadowRoot.innerHTML = `
            <style>
                .badge {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .badge:hover {
                    transform: scale(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10; position: relative;
                }
            </style>
            <div class="tag-cloud d-flex flex-wrap justify-content-center align-items-center p-3"></div>
        `;
        this.shadowRoot.prepend(this.bootstrapCSS)
        this.shadowRoot.appendChild(this.bootstrapJS)
        const tagCloudContainer = this.shadowRoot.querySelector('.tag-cloud');
        shuffledSkills.forEach((skill, index) => {
            const tagElement = document.createElement('span');
            const baseFontSize = 0.8;
            const step = 0.25;
            const fontSize = baseFontSize + (skill.level * step);
            tagElement.className = `badge rounded-pill bg-${types[index % types.length]} mx-2 my-2 p-3`;
            tagElement.textContent = skill.text;
            tagElement.style.fontSize = `${fontSize}rem`;
            tagElement.setAttribute('data-aos', 'zoom-in');
            tagElement.setAttribute('data-aos-delay', `${index * 50}`);
            tagCloudContainer.appendChild(tagElement);
        });
    }

    loadFullStackSkills(skillData) {
        this.shadowRoot.innerHTML = `
        <div class="container my-5">
            <div class="row">
                <div class="col-12 bg-primary text-white text-center p-2 mb-3">
                    <h2 class="h4 m-0">My Full Stack skillset</h2>
                </div>
            </div>
            <div class="row g-3" id="fs-skills"></div>
        </div>
        `
        this.shadowRoot.prepend(this.bootstrapCSS)
        this.shadowRoot.appendChild(this.bootstrapJS)
        const list = this.shadowRoot.querySelector("#fs-skills")

        for (const [key, value] of Object.entries(skillData)) {
            const column = document.createElement('div');
            column.className = 'col-12 col-md-4 col-lg-2';
            const card = document.createElement('div');
            card.className = 'card h-100';
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            const h5 = document.createElement('h5');
            h5.className = 'card-title';
            h5.textContent = key;
            cardBody.appendChild(h5);
            const ul = document.createElement('ul');
            ul.className = 'list-group list-group-flush';
            value.skills.forEach(skill => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = skill.text;
                ul.appendChild(li);
            });
            cardBody.appendChild(ul);
            card.appendChild(cardBody);
            column.appendChild(card);
            list.appendChild(column);
        }
    }
}

export default SkillCloud;
