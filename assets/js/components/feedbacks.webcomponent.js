class ShowFeedbacks extends HTMLElement {

    connectedCallback() {
        this.loadFeedbacks();
    }

    async loadFeedbacks() {
        const src = this.getAttribute('src');
        if (!src) {
            console.error('Feedback component requires a "src" attribute.');
            this.shadowRoot.innerHTML = `<p>Error: src attribute is missing.</p>`;
            return;
        }
        try {
            const response = await fetch(src);
            const feedbacks = await response.json();
            this.createFeedbacks(feedbacks);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            this.shadowRoot.innerHTML = `<p>Error loading feedbacks.</p>`;
        }
    }

    createFeedbacks = (feedbacks) => {
        feedbacks.forEach(feedback => {
            let feedBack = `
        <div class="row">
            <div class="col">
              <figure class="text-monospace mb-1">
                <blockquote class="blockquote">
                  <p>${feedback.text}</p>
                </blockquote>
                <figcaption class="blockquote-footer">${feedback.name} at <cite>${feedback.company}</cite></figcaption>
              </figure>
            </div>
          </div>
        `
            this.innerHTML += feedBack
        })
    }
}

export default ShowFeedbacks;