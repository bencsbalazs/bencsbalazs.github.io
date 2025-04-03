class CredlyBadgeList extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const badgeIds = this.getAttribute("badge-ids")?.split(",") || [];
        const container = document.createElement("div");
        container.classList.add("row");
        badgeIds.forEach((badgeId) => {
            const badgeDiv = document.createElement("div");
            const badgeCol = document.createElement("div");
            badgeCol.classList.add("col-lg-3", "col-md-4", "col-sm-6", "col-xs-6", "mb-3", "content-center");
            badgeDiv.classList.add("d-block", "mx-auto");
            badgeDiv.setAttribute("data-iframe-width", "250");
            badgeDiv.setAttribute("data-iframe-height", "250");
            badgeDiv.setAttribute("data-share-badge-id", badgeId.trim());
            badgeDiv.setAttribute("data-share-badge-host", "https://www.credly.com");
            badgeCol.appendChild(badgeDiv);
            container.appendChild(badgeCol);
        });
        this.loadScript();
        this.appendChild(container);
    }
    loadScript() {
        if (!document.querySelector('script[src="https://cdn.credly.com/assets/utilities/embed.js"]')) {
            const script = document.createElement("script");
            script.src = "https://cdn.credly.com/assets/utilities/embed.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }
}

export default CredlyBadgeList;

// Usage:
// customElements.define('credly-badge-list', CredlyBadgeList);
// <credly-badge-list badge-ids="123456,789012"></credly-badge-list>
