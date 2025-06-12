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
            #clock {
                width: 100%;
                display: block;
                margin: 0 auto;
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

class AnalogClock extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
        <style>
          .clock {
            width: 200px;
            height: 200px;
            border: 10px solid #00aaff;
            border-radius: 50%;
            position: relative;
            background-color: white;
          }

          .number {
            position: absolute;
            font-size: 24px;
            color: #00aaff;
            font-family: sans-serif;
            font-weight: bold;
          }

          .number-12 { top: 10px; left: 50%; transform: translateX(-50%); }
          .number-3 { top: 50%; right: 10px; transform: translateY(-50%); }
          .number-6 { bottom: 10px; left: 50%; transform: translateX(-50%); }
          .number-9 { top: 50%; left: 10px; transform: translateY(-50%); }

          .center {
            width: 12px;
            height: 12px;
            background: #00aaff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
          }

          .hand {
            position: absolute;
            width: 50%;
            top: 50%;
            left: 50%;
            transform-origin: 0% 50%;
            background: #00aaff;
            border-radius: 4px;
          }

          .hour {
            height: 8px;
            width: 30%;
            z-index: 3;
          }

          .minute {
            height: 6px;
            width: 40%;
            z-index: 2;
          }

          .second {
            height: 2px;
            width: 45%;
            background: #0077aa;
            z-index: 1;
          }
        </style>

        <div class="clock">
          <div class="number number-12">12</div>
          <div class="number number-3">3</div>
          <div class="number number-6">6</div>
          <div class="number number-9">9</div>
          <div class="hand hour" id="hour"></div>
          <div class="hand minute" id="minute"></div>
          <div class="hand second" id="second"></div>
          <div class="center"></div>
        </div>
      `;
    }

    connectedCallback() {
        this.updateClock();
        this.interval = setInterval(() => this.updateClock(), 1000);
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    updateClock() {
        const now = new Date();
        const second = now.getSeconds();
        const minute = now.getMinutes();
        const hour = now.getHours();

        const secondDeg = second * 6;
        const minuteDeg = minute * 6 + second * 0.1;
        const hourDeg = (hour % 12) * 30 + minute * 0.5;

        this.shadowRoot.getElementById("hour").style.transform = `rotate(${hourDeg}deg)`;
        this.shadowRoot.getElementById("minute").style.transform = `rotate(${minuteDeg}deg)`;
        this.shadowRoot.getElementById("second").style.transform = `rotate(${secondDeg}deg)`;
    }
}

export { DigitalClock, AnalogClock };
