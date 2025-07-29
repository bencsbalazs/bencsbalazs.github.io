class skillCloud extends HTMLElement {
    constructor() {
        super();
        this.tagCloud = document.createElement('div');
        this.tagCloud.classList.add('tag-cloud', 'text-center');
        this.appendChild(this.tagCloud);
        this.render();
    }
    render() {
        const tags = [
            { text: 'Angular' },
            { text: 'Ansible' },
            { text: 'ChatGPT' },
            { text: 'Cloudant' },
            { text: 'CSS' },
            { text: 'Django' },
            { text: 'Docker' },
            { text: 'Gemini' },
            { text: 'Git' },
            { text: 'GraphQL' },
            { text: 'HTML' },
            { text: 'JavaScript' },
            { text: 'Jira' },
            { text: 'MongoDB' },
            { text: 'MySQL' },
            { text: 'Node' },
            { text: 'PHP' },
            { text: 'Plotly' },
            { text: 'PostgreSQL' },
            { text: 'Python' },
            { text: 'React' },
            { text: 'RestAPI' },
            { text: 'TypeScript' },

        ];
        const types = ['primary', 'secondary', 'success', 'danger', 'warning'];
        const tagCloud = this.querySelector('.tag-cloud');
        const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
        shuffledTags.forEach((tag, index) => {
            const tagElement = document.createElement(`span`);
            tagElement.className = `badge rounded-pill bg-${types[(index % 5)]} m-3 p-4`;
            tagElement.innerHTML = `${tag.text}`;
            tagElement.style.fontSize = `1.5em`;
            //tagElement.style.transform = `rotate(${(Math.random() * 6) - 3}deg)`;
            tagCloud.appendChild(tagElement);
        });
    }
}

export default skillCloud;
