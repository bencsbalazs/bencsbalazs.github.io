/**
 * @class BlogSection
 * @description A web component that displays a blog section with a table of contents and post rendering from markdown files.
 * 
 * @property {string} src - The URL to the JSON file containing the blog posts data.
 * @property {string} [marked-src] - The URL to the marked.js library.
 * @property {string} [mathjax-src] - The URL to the MathJax library.
 */
class BlogSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.markedSrc = this.getAttribute('marked-src') || 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        this.mathjaxSrc = this.getAttribute('mathjax-src') || 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    }

    async connectedCallback() {
        try {
            const posts = await this.fetchPosts();
            this.render(posts);
            this.addEventListeners();
            if (posts.length > 0) {
                const firstPostLink = this.shadowRoot.querySelector('.post-link');
                if (firstPostLink) {
                    this.renderPost(firstPostLink.href);
                }
            }
        } catch (error) {
            console.error('Failed to build blog system:', error);
            this.shadowRoot.innerHTML = `<p class="text-danger text-center">Failed to load blog. Please try again later.</p>`;
        }
    }

    async fetchPosts() {
        const src = this.getAttribute('src');
        if (!src) {
            throw new Error('The "src" attribute is required.');
        }
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }
        return response.json();
    }

    render(posts) {
        const tableOfContentsHTML = posts.map(post => `
            <li class="nav-item">
                <a class="nav-link post-link" href="/assets/posts/${post.link}.html" data-tags="${post.tags}">${post.title}</a>
            </li>
        `).join('');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="assets/vendor/bootstrap/css/bootstrap.min.css">
            <style>
                #tableOfContent h4 {
                    font-weight: bold;
                }
                .nav-link {
                    cursor: pointer;
                }
            </style>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2>Dear Diary...</h2>
                        <hr class="mb-3">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-9 col-sm-12" id="blogContainer"></div>
                    <div class="col-md-3 col-sm-12" id="tableOfContent">
                        <h4>Table of Content</h4>
                        <ul class="nav flex-column">
                            ${tableOfContentsHTML}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const toc = this.shadowRoot.getElementById('tableOfContent');
        toc.addEventListener('click', e => {
            if (e.target.classList.contains('post-link')) {
                e.preventDefault();
                this.renderPost(e.target.href);
            }
        });
    }

    async renderPost(url) {
        try {
            await this.loadScript(this.markedSrc, 'marked');
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch post content: ${response.statusText}`);
            const markdown = await response.text();
            const blogContainer = this.shadowRoot.getElementById('blogContainer');
            blogContainer.innerHTML = window.marked.parse(markdown);

            if (blogContainer.querySelector('.mathjax')) {
                await this.loadScript(this.mathjaxSrc, 'MathJax');
                MathJax.typesetPromise(blogContainer.querySelectorAll('.mathjax'));
            }
        } catch (error) {
            console.error('Error rendering post:', error);
            this.shadowRoot.getElementById('blogContainer').innerHTML = `<p class="text-danger">Error loading post content.</p>`;
        }
    }

    loadScript(src, globalName) {
        return new Promise((resolve, reject) => {
            if (window[globalName]) {
                return resolve();
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
}

export default BlogSection;