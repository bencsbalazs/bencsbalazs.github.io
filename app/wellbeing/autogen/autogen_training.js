class AutogenMantra extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mantras = [];
        this.currentIndex = 0;
        this.isReading = false;
        this.pauseInSeconds = 5;
        this.speaker = window.speechSynthesis;
        this.utterance = null;
        this.intervalId = null;

        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
          background-color: #f4f4f4;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #mantra-display {
          font-size: 2em;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease-in-out;
        }
        #controls {
          margin-top: 20px;
        }
        button {
          padding: 10px 20px;
          font-size: 1em;
          cursor: pointer;
          border: none;
          border-radius: 4px;
          margin: 0 5px;
        }
        #start-btn {
          background-color: #28a745;
          color: white;
        }
        #stop-btn {
          background-color: #dc3545;
          color: white;
        }
        label {
          font-size: 1em;
        }
        input[type="number"] {
          width: 60px;
          padding: 5px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
      </style>
      <div id="mantra-display"></div>
      <div id="controls">
        <label for="pause-input">Szünet (másodperc):</label>
        <input type="number" id="pause-input" value="5" min="1">
        <button id="start-btn">Indítás</button>
        <button id="stop-btn">Leállítás</button>
      </div>
    `;

        this.mantraDisplay = this.shadowRoot.querySelector('#mantra-display');
        this.startButton = this.shadowRoot.querySelector('#start-btn');
        this.stopButton = this.shadowRoot.querySelector('#stop-btn');
        this.pauseInput = this.shadowRoot.querySelector('#pause-input');

        this.startButton.addEventListener('click', () => this.startReading());
        this.stopButton.addEventListener('click', () => this.stopReading());
        this.pauseInput.addEventListener('change', (e) => this.pauseInSeconds = parseInt(e.target.value));
    }

    connectedCallback() {
        this.loadMantras();
    }

    async loadMantras() {
        try {
            const response = await fetch('training.json');
            const data = await response.json();
            this.mantras = data.mantras;
            if (this.mantras.length > 0) {
                this.mantraDisplay.textContent = 'Készen áll az indításra!';
            }
        } catch (error) {
            console.error('Hiba a mantrák betöltésekor:', error);
            this.mantraDisplay.textContent = 'Hiba a mantrák betöltésekor.';
        }
    }

    startReading() {
        if (this.isReading || this.mantras.length === 0) return;
        this.isReading = true;
        this.currentIndex = 0;
        this.readNextMantra();
        this.intervalId = setInterval(() => this.readNextMantra(), this.pauseInSeconds * 1000 + this.estimateSpeechDuration());
    }

    stopReading() {
        this.isReading = false;
        clearInterval(this.intervalId);
        this.speaker.cancel();
        this.mantraDisplay.textContent = 'Leállítva.';
    }

    readNextMantra() {
        if (this.currentIndex >= this.mantras.length) {
            this.stopReading();
            this.mantraDisplay.textContent = 'Vége.';
            return;
        }

        const mantra = this.mantras[this.currentIndex].text;
        this.mantraDisplay.textContent = mantra;

        this.utterance = new SpeechSynthesisUtterance(mantra);
        this.utterance.lang = 'hu-HU';
        this.speaker.speak(this.utterance);

        this.currentIndex++;
    }

    estimateSpeechDuration() {
        const text = this.mantras[this.currentIndex]?.text || '';
        // A magyar nyelv átlagos beszédsebessége kb. 150 szó per perc, azaz 2.5 szó per másodperc.
        const words = text.split(' ').length;
        return (words / 2.5) * 1000; // Ezt a másodpercet átváltjuk milliszekundummá
    }
}

customElements.define('autogen-mantra', AutogenMantra);