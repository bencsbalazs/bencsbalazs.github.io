class BlogComponent extends HTMLElement {
    constructor() {
        super();
    }

    markedJs = "https://cdn.jsdelivr.net/npm/marked/marked.min.js"
    mathJaxJs = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"

    connectedCallback() {
        this.buildBlogSystem();
    }

    async buildBlogSystem () {
        this.innerHTML = `<div class='row'>
            <div class='col-12'>
                <h2>Dear Diary...</h2>
                <hr class="mb-3">
            </div>
        </div>
        <div class='row'>
            <div class='col-md-9 col-sm-12' id='blogContainer'></div>
            <div class='col-md-3 col-sm-12' id='tableOfContent'><h4>Table of Content</h4></div>
        </div>`

        try {
            await fetch((window.location.protocol === 'http:'
                ? 'http://127.0.0.1:5500/'
                : 'https://bencsbalazs.github.io/') + 'assets/jsons/blogposts.json')
                .then((response) => response.json())
                .then((data) => { this.renderBlog(data); })
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    renderBlog(data) {
        this.querySelector("#tableOfContent").append(document.createElement("ul"))
        data.forEach(post => {
            let postLink = document.createElement("a")
            let listElement = document.createElement("li")
            postLink.href = "/assets/posts/" + post.link + ".html"
            postLink.setAttribute("data-tags", post.tags)
            this.addListener(postLink)
            postLink.text = post.title
            listElement.append(postLink)
            document.querySelector("#tableOfContent > ul").append(listElement)
        });
        this.querySelector("#tableOfContent a").click()
    }

    addListener = (linkElement) => {
        linkElement.addEventListener("click", (e) => {
            e.preventDefault();
            if (!document.querySelector('script[src="'+this.mathJaxJs+'"]')) {
                const mscript = document.createElement("script")
                mscript.src = this.mathJaxJs
                document.body.appendChild(mscript)
            }
            this.renderPost(linkElement.href);
        });
    }

    renderPost(url) {
        fetch(url)
            .then(resp => resp.text())
            .then(md => {
                document.getElementById('blogContainer').innerHTML = md;
                document.querySelectorAll("#blogContainer > p").forEach((c) => {
                    if (c.classList.contains("mathjax")) {
                        MathJax.typesetPromise([c])
                    }
                })
            })
            .catch(console.error);
    }
}

export default BlogComponent;
