class BlogComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.buildBlogSystem();
    }

    async buildBlogSystem () {
        const markdown = document.createElement('script')
        markdown.src = "https://cdn.jsdelivr.net/npm/marked"
        const mathExtension = document.createElement('script')
        mathExtension.src = "https://cdn.jsdelivr.net/npm/marked-katex-extension/dist/index.umd.js"

        this.innerHTML = `<div class='row'>
            <div class='col-12'>
                <h2>Dear Diary...</h2>
            </div>
        </div>
        <div class='row'>
            <div class='col-md-9 col-sm-12' id='blogContainer'></div>
            <div class='col-md-3 col-sm-12' id='tableOfContent'><h4>Table of Content</h4></div>
        </div>`

        this.append(markdown)
        this.append(mathExtension)
        try {
            await fetch((window.location.protocol === 'http:'
                ? 'http://127.0.0.1:5500/'
                : 'https://bencsbalazs.github.io/') + 'assets/jsons/blogposts.json')
                .then((response) => response.json())
                .then((data) => { this.renderBlog(data); });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    renderBlog(data) {
        this.querySelector("#tableOfContent").append(document.createElement("ul"))
        data.forEach(post => {
            let postLink = document.createElement("a")
            let listElement = document.createElement("li")
            postLink.href = "/assets/posts/" + post.link + ".md"
            postLink.setAttribute("data-mathExtension", post.mathExtension)
            postLink.text = post.title
            postLink.addEventListener("click", (e) => {
                e.preventDefault()
                fetch(postLink.href)
                    .then(resp => resp.text())
                    .then(md => marked.parse(md))
                    .then(html => {
                        document.getElementById('blogContainer').innerHTML = html;
                    })
                    .catch(console.error);
            })
            listElement.append(postLink)
            document.querySelector("#tableOfContent > ul").append(listElement)
        });
    }
}

export default BlogComponent;
