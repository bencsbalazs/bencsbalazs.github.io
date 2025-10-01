/**
 * @class FeedbacksSection
 * @description A web component that displays a section of feedbacks from a JSON source, styled with Bootstrap 5.
 * 
 * @property {string} src - The URL to the JSON file containing the feedbacks data.
 */
class FeedbacksSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        try {
            const feedbacks = await this.fetchFeedbacks();
            this.render(feedbacks);
        } catch (error) {
            console.error('Failed to render feedbacks section:', error);
            this.shadowRoot.innerHTML = `<p class="text-danger text-center">Failed to load feedbacks. Please try again later.</p>`;
        }
    }

    /**
     * @description Fetches the feedbacks data from the JSON source.
     * @returns {Promise<Array>} A promise that resolves to an array of feedback objects.
     */
    async fetchFeedbacks() {
        const src = this.getAttribute('src');
        if (!src) {
            throw new Error('The "src" attribute is required.');
        }

        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to fetch feedbacks: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * @description Renders the feedbacks section using Bootstrap 5 classes.
     * @param {Array} feedbacks - An array of feedback objects.
     */
    render(feedbacks) {
        const feedbacksHTML = feedbacks.map(feedback => this.createFeedbackItemHTML(feedback)).join('');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/assets/vendor/bootstrap/css/bootstrap.min.css">
            <div class="container">
                ${feedbacksHTML}
            </div>
        `;
    }

    /**
     * @description Creates the HTML for a single feedback item using Bootstrap 5 classes.
     * @param {object} feedback - The feedback object.
     * @returns {string} The HTML string for the feedback item.
     */
    createFeedbackItemHTML(feedback) {
        const { text, name, company } = feedback;
        return `
            <div class="row justify-content-center mb-3">
                <div class="col-lg-10 col-md-12">
                    <figure class="text-monospace">
                        <blockquote class="blockquote">
                            <p class="mb-0">"${text}"</p>
                        </blockquote>
                        <figcaption class="blockquote-footer text-end">
                            ${name} at <cite title="Source Title">${company}</cite>
                        </figcaption>
                    </figure>
                </div>
            </div>
        `;
    }
}

export default FeedbacksSection;
