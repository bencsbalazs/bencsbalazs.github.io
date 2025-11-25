/**
 * @class SkillCloud
 * @description A web component to display skills as a cloud or a full-stack view.
 * @property {string} src - The source URL for the skills JSON data.
 * @property {string} type - The type of display, either "cloud" or "fullstack".
 */
class SkillCloud extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._setupStylesAndScripts();
    }

    /**
     * @description Sets up the required CSS and JS files for the component.
     * @private
     */
    _setupStylesAndScripts() {
        this.bootstrapCSS = this._createLink("/assets/vendor/bootstrap/css/bootstrap.min.css", "stylesheet");
        this.customCSS = this._createLink("/assets/css/style.css", "stylesheet");
        this.bootstrapIcons = this._createLink("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css", "stylesheet");
        this.bootstrapJS = this._createScript("/assets/vendor/bootstrap/js/bootstrap.bundle.min.js");
    }

    /**
     * @description Creates a <link> element.
     * @param {string} href - The URL of the stylesheet.
     * @param {string} rel - The relationship of the linked file.
     * @returns {HTMLLinkElement}
     * @private
     */
    _createLink(href, rel) {
        const link = document.createElement("link");
        link.setAttribute("rel", rel);
        link.setAttribute("href", href);
        return link;
    }

    /**
     * @description Creates a <script> element.
     * @param {string} src - The URL of the script.
     * @returns {HTMLScriptElement}
     * @private
     */
    _createScript(src) {
        const script = document.createElement("script");
        script.setAttribute("src", src);
        return script;
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
            const type = this.getAttribute("type");
            if (!type || type === "cloud") {
                this._loadSkillsAsCloud(skillData);
            } else {
                this._loadFullStackSkills(skillData);
            }
        } catch (error) {
            console.error('Error loading skills:', error);
            this.shadowRoot.innerHTML = `<p>Error loading skills.</p>`;
        }
    }

    /**
     * @description Renders the skills as a tag cloud.
     * @param {object} skillData - The skill data object.
     * @private
     */
    _loadSkillsAsCloud(skillData) {
        let allSkills = [];
        for (const value of Object.values(skillData)) {
            value.skills.forEach(group => {
                allSkills.push(...group.skills);
            });
        }

        const shuffledSkills = [...allSkills].sort(() => Math.random() - 0.5);
        const types = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];

        const style = `
            .badge {
                transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            .badge:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10;
                position: relative;
            }
        `;

        this.shadowRoot.innerHTML = `<style>${style}</style><div class="tag-cloud d-flex flex-wrap justify-content-center align-items-center p-3"></div>`;
        this.shadowRoot.prepend(this.customCSS);
        this.shadowRoot.prepend(this.bootstrapCSS);
        this.shadowRoot.appendChild(this.bootstrapJS);

        const tagCloudContainer = this.shadowRoot.querySelector('.tag-cloud');
        shuffledSkills.forEach((skill, index) => {
            tagCloudContainer.appendChild(this._createSkillBadge(skill, index, types));
        });
    }

    /**
     * @description Creates a skill badge element for the cloud view.
     * @param {object} skill - The skill object.
     * @param {number} index - The index of the skill.
     * @param {string[]} types - The array of badge types.
     * @returns {HTMLSpanElement}
     * @private
     */
    _createSkillBadge(skill, index, types) {
        const tagElement = document.createElement('span');
        const baseFontSize = 0.8;
        const step = 0.25;
        const fontSize = baseFontSize + (skill.level * step);
        tagElement.className = `badge rounded-pill bg-${types[index % types.length]} mx-2 my-2 p-3`;
        tagElement.textContent = skill.text;
        tagElement.style.fontSize = `${fontSize}rem`;
        tagElement.setAttribute('data-aos', 'zoom-in');
        tagElement.setAttribute('data-aos-delay', `${index * 50}`);
        return tagElement;
    }

    /**
     * @description Renders the skills as a full-stack view.
     * @param {object} skillData - The skill data object.
     * @private
     */
    _loadFullStackSkills(skillData) {
        const style = `
            .skill-card {
                transition: all 0.3s ease-in-out;
            }
            .skill-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
            }
            .skill-icon {
                font-size: 3rem;
                color: var(--bs-primary);
            }
            .skill-name {
                font-size: 1.1rem;
                font-weight: 500;
            }
            .bg-primary-soft {
                background-color: rgba(var(--bs-primary-rgb), 0.1);
                color: var(--bs-primary) !important;
            }
        `;

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <div class="container-fluid my-5">
                <div class="row g-4 justify-content-center" id="fs-skills"></div>
            </div>
        `;

        this.shadowRoot.prepend(this.customCSS);
        this.shadowRoot.prepend(this.bootstrapCSS);
        this.shadowRoot.prepend(this.bootstrapIcons);
        this.shadowRoot.appendChild(this.bootstrapJS);

        const list = this.shadowRoot.querySelector("#fs-skills");
        for (const value of Object.values(skillData)) {
            list.appendChild(this._createSkillCard(value));
        }
    }

    /**
     * @description Creates a skill card element for the full-stack view.
     * @param {object} category - The category object.
     * @returns {HTMLDivElement}
     * @private
     */
    _createSkillCard(category) {
        const column = document.createElement('div');
        column.className = 'col-lg col-md-4 col-sm-6';

        const card = document.createElement('div');
        card.className = 'card h-100 text-center shadow-sm rounded-3 border-0 skill-card';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-4';

        const icon = document.createElement('i');
        icon.className = `bi ${category.icon} skill-icon mb-3`;
        cardBody.appendChild(icon);

        const h5 = document.createElement('h5');
        h5.className = 'card-title fw-bold mb-3';
        h5.textContent = category.title;
        cardBody.appendChild(h5);

        category.skills.forEach(group => {
            if (group.groupName) {
                const groupName = document.createElement('p');
                groupName.className = 'text-muted fw-light mb-2';
                groupName.textContent = group.groupName;
                cardBody.appendChild(groupName);
            }

            const skillContainer = document.createElement('div');
            skillContainer.className = 'd-flex flex-wrap justify-content-center';

            group.skills.forEach(skill => {
                skillContainer.appendChild(this._createSkillPill(skill));
            });
            cardBody.appendChild(skillContainer);
        });

        card.appendChild(cardBody);
        column.appendChild(card);
        return column;
    }

    /**
     * @description Creates a skill pill element for the full-stack view.
     * @param {object} skill - The skill object.
     * @returns {HTMLSpanElement}
     * @private
     */
    _createSkillPill(skill) {
        const skillPill = document.createElement('span');
        skillPill.className = 'badge rounded-pill bg-primary-soft text-white m-1 skill-name';
        skillPill.textContent = skill.text;
        return skillPill;
    }
}

export default SkillCloud;