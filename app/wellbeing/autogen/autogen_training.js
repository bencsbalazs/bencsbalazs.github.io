class AutogenMantra extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.mantras = [];
    this.currentIndex = 0;
    this.isReading = false;
    this.defaultPauseInSeconds = 5;
    this.speechRate = 1.0;
    this.speaker = window.speechSynthesis;
    this.utterance = null;
    this.timeoutId = null;

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
          margin-bottom: 20px; /* Added margin for separation */
        }
        #controls {
          margin-top: 20px;
          display: flex; /* Use flexbox for better layout */
          flex-wrap: wrap; /* Allow wrapping on smaller screens */
          justify-content: center; /* Center items */
          gap: 10px; /* Space between items */
        }
        .control-group {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        button {
          padding: 10px 20px;
          font-size: 1em;
          cursor: pointer;
          border: none;
          border-radius: 4px;
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
          white-space: nowrap; /* Prevent label from wrapping */
        }
        input[type="number"] {
          width: 60px;
          padding: 5px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        input[type="range"] {
            width: 120px; /* Adjust width as needed */
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
      </style>
      <div id="mantra-display"></div>
      <div id="controls">
        <div class="control-group">
            <label for="pause-input">Alap szünet (mp):</label>
            <input type="number" id="pause-input" value="${this.defaultPauseInSeconds}" min="1">
        </div>
        <div class="control-group">
            <label for="speech-rate-input">Beszéd sebesség:</label>
            <input type="range" id="speech-rate-input" min="0.5" max="2.0" step="0.1" value="${this.speechRate}">
            <span id="speech-rate-value">${this.speechRate.toFixed(1)}</span>
        </div>
        <div class="control-group">
          <label for="music">Legyen háttérzene:</label>
          <input type="checkbox" id="music" checked>
        </div>
        <button id="start-btn">Indítás</button>
        <button id="stop-btn">Leállítás</button>
      </div>
      <div id="meditation-duration-container" style="margin-top: 15px; font-style: italic; color: #555;"></div>
    `;

    this.mantraDisplay = this.shadowRoot.querySelector('#mantra-display');
    this.startButton = this.shadowRoot.querySelector('#start-btn');
    this.stopButton = this.shadowRoot.querySelector('#stop-btn');
    this.pauseInput = this.shadowRoot.querySelector('#pause-input');
    this.speechRateInput = this.shadowRoot.querySelector('#speech-rate-input');
    this.speechRateValueSpan = this.shadowRoot.querySelector('#speech-rate-value');
    this.meditationDurationContainer = this.shadowRoot.querySelector('#meditation-duration-container');


    this.startButton.addEventListener('click', () => this.startReading());
    this.stopButton.addEventListener('click', () => this.stopReading());
    this.pauseInput.addEventListener('change', (e) => {
      this.defaultPauseInSeconds = parseInt(e.target.value);
      this.calculateAndDisplayDuration();
    });
    this.speechRateInput.addEventListener('input', (e) => {
      this.speechRate = parseFloat(e.target.value);
      this.speechRateValueSpan.textContent = this.speechRate.toFixed(1);
      this.calculateAndDisplayDuration();
      if (this.utterance && this.speaker.speaking) {
        this.speaker.cancel();
        this.readCurrentMantraAgain();
      }
    });
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
      } else {
        this.mantraDisplay.textContent = 'Nincs mantra betöltve.';
      }
      this.calculateAndDisplayDuration();
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
  }

  stopReading() {
    this.isReading = false;
    clearTimeout(this.timeoutId);
    this.speaker.cancel();
    this.mantraDisplay.textContent = 'Leállítva.';
  }

  calculateAndDisplayDuration() {
    if (!this.mantras || this.mantras.length === 0) {
      this.meditationDurationContainer.textContent = '';
      return;
    }

    // 1. Összes szünetidő kiszámítása
    const totalPauseInSeconds = this.mantras.reduce((sum, mantra) => {
      // A mantra saját szünetidejét használjuk, vagy az alapértelmezettet, ha nincs megadva.
      return sum + (mantra.pause || this.defaultPauseInSeconds);
    }, 0);

    // 2. A beszédidő becslése
    const avgWordsPerSecond = 2.5; // Átlagos magyar beszédsebesség (szó/mp)
    const totalSpeechInSeconds = this.mantras.reduce((sum, mantra) => {
      const wordCount = mantra.text.split(' ').length;
      const speechDuration = wordCount / avgWordsPerSecond;
      return sum + speechDuration;
    }, 0) / this.speechRate; // Korrekció a beállított beszédsebességgel

    const totalDurationInSeconds = Math.round(totalPauseInSeconds + totalSpeechInSeconds);

    const minutes = Math.floor(totalDurationInSeconds / 60);
    const seconds = totalDurationInSeconds % 60;

    this.meditationDurationContainer.textContent = `A meditáció teljes hossza kb. ${minutes} perc ${seconds} másodperc.`;
  }

  readCurrentMantraAgain() {
    // This function is called when speech rate changes mid-mantra
    // It re-reads the current mantra with the new rate
    if (this.currentIndex > 0 && this.currentIndex <= this.mantras.length) {
      const mantra = this.mantras[this.currentIndex - 1].text; // Get the previously spoken mantra
      this.mantraDisplay.textContent = mantra; // Ensure display is correct
      this.speakMantra(mantra, true); // Speak it again, but don't advance index or schedule next
    }
  }

  speakMantra(text, isRespeak = false) {
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'hu-HU';
    this.utterance.rate = this.speechRate;

    this.utterance.onend = () => {
      if (!isRespeak && this.isReading) { // Only schedule next if not a respeak and still reading
        const currentMantra = this.mantras[this.currentIndex - 1]; // Get the mantra that just finished
        // Use mantra-specific pause, or default if not specified
        const pauseDuration = (currentMantra.pause || this.defaultPauseInSeconds) * 1000;
        this.timeoutId = setTimeout(() => this.readNextMantra(), pauseDuration);
      }
    };

    this.utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      if (!isRespeak && this.isReading) {
        // If an error occurs, still try to move to the next mantra after a default pause
        const currentMantra = this.mantras[this.currentIndex - 1];
        const pauseDuration = (currentMantra.pause || this.defaultPauseInSeconds) * 1000;
        this.timeoutId = setTimeout(() => this.readNextMantra(), pauseDuration);
      }
    };

    this.speaker.speak(this.utterance);
  }

  readNextMantra() {
    if (!this.isReading) {
      this.mantraDisplay.textContent = 'Leállítva.';
      return;
    }

    if (this.currentIndex >= this.mantras.length) {
      this.stopReading();
      this.mantraDisplay.textContent = 'Vége.';
      return;
    }

    const mantraData = this.mantras[this.currentIndex];
    this.mantraDisplay.textContent = mantraData.text;

    this.speakMantra(mantraData.text); // Speak the current mantra

    this.currentIndex++;
  }
}

customElements.define('autogen-mantra', AutogenMantra);