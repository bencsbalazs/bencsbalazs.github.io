class CredlyBadgeList extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        // const badgeIds = this.getAttribute("badge-ids")?.split(",") || [];
        const badgeIdsValid = [
            "2e9d7b8c-5d79-4bdf-9df5-7349dafefed8", // IBM Agile Explorer
            "d0ea1870-8fe8-42d8-b00e-3c4b2dbcc941", // Enterprise Design Thinking Practitioner
            "f9156ce1-e53a-49d5-b4e0-b1794405520e", // Think Like a Hacker
            "b56295bf-abed-48b6-a04e-6c3e69da8bca", // IBM Cloud Essentials
            "23e12707-9fe9-48c8-a903-4a4459bd18df", // Node-RED: Basics to Bots
            "440660f6-ac7d-464b-bc60-62b2be500c09", // Build Chatbots with Watson Conversation
            "9581eec4-c13b-4949-aae5-21baca1fc93b", // IBM Mentor
            "c51f4f89-de21-44de-bc06-23ed4f4a168d", // Docker Essentials: A Developer Introduction
            "6b77f1a1-3457-4fbc-8826-26f396d46d06", // Cognitive Practitioner
            "ecc58aef-c35c-48d0-a4b7-07f155b03347", // IBM Agile Advocate
            "e5bf6d3d-bc03-418e-8888-6bc3251c1f97", // Watson Speech to Text
            "65aacd05-d549-49d8-8117-e8d7276cc830", // Watson Discovery Service Foundations
            "8cf39b6f-e853-4edb-83b8-b703846de18a", // Security and Privacy by Design Foundations
            "a1a19181-ccf7-45d0-ab43-b0426f3fbce0", // IBM Recognized Speaker/ Presenter
            "72e7ad83-3b18-4b17-b090-752ef9a9729e", // IBM Growth Behaviors
            "0c9bdc3e-d10e-4f73-83ab-001833d95a29", // XP Farm - Experienced XP Developer
            "e071fb56-064d-4257-b026-c237658d9a4a", // Engineering with Excellence Professional
            "64b0817a-1b21-49d3-8d5b-f879d8aa6a6c", // Trustworthy AI and AI Ethics
        ].filter((badgeId) => badgeId.trim() !== "");
        const container = document.createElement("div");
        container.classList.add("row");
        badgeIdsValid.forEach((badgeId) => {
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
