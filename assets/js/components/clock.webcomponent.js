class DigitalClock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.width = this.getAttribute('width') || '200px';
        this.height = this.getAttribute('height') || '100px';
        this.render();
    }

    connectedCallback() {
        this.updateTime();
        this.interval = setInterval(() => this.updateTime(), 1000);
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        this.shadowRoot.querySelector('#clock').textContent = `${hours}:${minutes}:${seconds}`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            @font-face {
                font-family: 'Digital Numbers';
                font-style: normal;
                font-weight: 400;
                src: local('Digital Numbers'), url('https://fonts.cdnfonts.com/s/15953/DigitalNumbers-Regular.woff') format('woff');
            }
            #clock {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2em;
                font-family: 'Digital Numbers', sans-serif;
                background: black;
                color: white;
                border-radius: 10px;
                width: ${this.width};
                height: ${this.height};
            }
            </style>
            <div id="clock">--:--:--</div>
        `;
    }
}

export default DigitalClock;
