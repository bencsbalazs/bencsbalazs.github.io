const UI_TEXTS = {
  ready: 'Készen áll az indításra!',
  noMantras: 'Nincs mantra betöltve.',
  loadError: 'Hiba a mantrák betöltésekor.',
  stopped: 'Leállítva.',
  finished: 'Vége.',
  meditationDurationPrefix: 'A meditáció teljes hossza kb. ',
  meditationDurationMinutes: ' perc ',
  meditationDurationSeconds: ' másodperc.',
  pauseLabel: 'Alap szünet (mp):',
  speedLabel: 'Beszéd sebesség:',
  musicSelectLabel: 'Háttérzene:',
  musicNone: 'Nincs',
  musicWater: 'Vízcsobogás',
  musicRain: 'Eső hangja',
  musicForest: 'Erdei hangok',
  startButton: 'Indítás',
  stopButton: 'Leállítás',
};

const BACKGROUND_MUSIC_SOURCES = {
  water: '../../assets/audio/water-splash.mp3',
  rain: '../../assets/audio/rain.mp3',
  forest: '../../assets/audio/forest.mp3',
};

class AutogenMantra extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.mantras = [];
    this.currentIndex = 0;
    this.isReading = false;
    this.defaultPauseInSeconds = 5;
    this.speechRate = 1;
    this.speaker = globalThis.speechSynthesis;
    this.utterance = null;
    this.timeoutId = null;
    this.audioPlayer = null;
    this.backgroundMusicPlayer = null;
    this.musicSelect = null;
    this.selectedMusic = 'none';

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
            <label for="pause-input">${UI_TEXTS.pauseLabel}</label>
            <input type="number" id="pause-input" value="${this.defaultPauseInSeconds}" min="1">
        </div>
        <div class="control-group">
            <label for="speech-rate-input">${UI_TEXTS.speedLabel}</label>
            <input type="range" id="speech-rate-input" min="0.5" max="2.0" step="0.1" value="${this.speechRate}">
            <span id="speech-rate-value">${this.speechRate.toFixed(1)}</span>
        </div>
        <div class="control-group">
          <label for="music-select">${UI_TEXTS.musicSelectLabel}</label>
          <select id="music-select">
            <option value="none">${UI_TEXTS.musicNone}</option>
            <option value="water">${UI_TEXTS.musicWater}</option>
            <option value="rain">${UI_TEXTS.musicRain}</option>
            <option value="forest">${UI_TEXTS.musicForest}</option>
          </select>
        </div>
        <button id="start-btn">${UI_TEXTS.startButton}</button>
        <button id="stop-btn">${UI_TEXTS.stopButton}</button>
      </div>
      <div id="meditation-duration-container" style="margin-top: 15px; font-style: italic; color: #555;"></div>
      <audio id="audio-player"></audio>
      <audio id="background-music-player" loop></audio>
    `;

    this.mantraDisplay = this.shadowRoot.querySelector('#mantra-display');
    this.startButton = this.shadowRoot.querySelector('#start-btn');
    this.stopButton = this.shadowRoot.querySelector('#stop-btn');
    this.pauseInput = this.shadowRoot.querySelector('#pause-input');
    this.speechRateInput = this.shadowRoot.querySelector('#speech-rate-input');
    this.speechRateValueSpan = this.shadowRoot.querySelector('#speech-rate-value');
    this.meditationDurationContainer = this.shadowRoot.querySelector('#meditation-duration-container');
    this.audioPlayer = this.shadowRoot.querySelector('#audio-player');
    this.backgroundMusicPlayer = this.shadowRoot.querySelector('#background-music-player');
    this.musicSelect = this.shadowRoot.querySelector('#music-select');

    this.startButton.addEventListener('click', () => this.startReading());
    this.stopButton.addEventListener('click', () => this.stopReading());
    this.audioPlayer.addEventListener('ended', () => this.scheduleNextMantra());
    this.audioPlayer.addEventListener('error', (e) => {
      console.error('Audio player error', e);
      this.scheduleNextMantra();
    });
    this.pauseInput.addEventListener('change', (e) => {
      this.defaultPauseInSeconds = Number.parseInt(e.target.value);
      this.calculateAndDisplayDuration();
    });
    this.speechRateInput.addEventListener('input', (e) => {
      this.speechRate = Number.parseFloat(e.target.value);
      this.speechRateValueSpan.textContent = this.speechRate.toFixed(1);
      this.calculateAndDisplayDuration();
      if (this.utterance && this.speaker.speaking) {
        this.speaker.cancel();
        this.readCurrentMantraAgain();
      }
    });
    this.musicSelect.addEventListener('change', (e) => {
      this.selectedMusic = e.target.value;
      if (this.isReading) {
        this.playBackgroundMusic();
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
        this.mantraDisplay.textContent = UI_TEXTS.ready;
      } else {
        this.mantraDisplay.textContent = UI_TEXTS.noMantras;
      }
      this.calculateAndDisplayDuration();
    } catch (error) {
      console.error(`${UI_TEXTS.loadError}:`, error);
      this.mantraDisplay.textContent = UI_TEXTS.loadError;
    }
  }

  startReading() {
    if (this.isReading || this.mantras.length === 0) return;
    this.isReading = true;
    this.currentIndex = 0;
    this.playBackgroundMusic();
    this.readNextMantra();
  }

  stopReading() {
    this.isReading = false;
    clearTimeout(this.timeoutId);
    this.speaker.cancel();
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.backgroundMusicPlayer.pause();
    this.backgroundMusicPlayer.currentTime = 0;
    this.mantraDisplay.textContent = UI_TEXTS.stopped;
  }

  calculateAndDisplayDuration() {
    if (!this.mantras || this.mantras.length === 0) {
      this.meditationDurationContainer.textContent = '';
      return;
    }

    let totalPauseInSeconds = 0;
    let totalContentInSeconds = 0;
    const avgWordsPerSecond = 2.5;

    for (let mantra of this.mantras) {
      totalPauseInSeconds += mantra.pause || this.defaultPauseInSeconds;

      if (mantra.duration) {
        totalContentInSeconds += mantra.duration;
      } else {
        // Különben becslést végzünk a szövegből (TTS).
        const wordCount = mantra.text.split(' ').length;
        const speechDuration = (wordCount / avgWordsPerSecond) / this.speechRate;
        totalContentInSeconds += speechDuration;
      }
    };

    const totalDurationInSeconds = Math.round(totalPauseInSeconds + totalContentInSeconds);
    const minutes = Math.floor(totalDurationInSeconds / 60);
    const seconds = totalDurationInSeconds % 60;

    this.meditationDurationContainer.textContent = `${UI_TEXTS.meditationDurationPrefix}${minutes}${UI_TEXTS.meditationDurationMinutes}${seconds}${UI_TEXTS.meditationDurationSeconds}`;
  }

  readCurrentMantraAgain() {
    if (this.currentIndex > 0 && this.currentIndex <= this.mantras.length) {
      const mantra = this.mantras[this.currentIndex - 1];
      if (!mantra.audioSrc) {
        this.mantraDisplay.textContent = mantra.text;
        this.speakMantra(mantra.text, true);
      }
    }
  }

  scheduleNextMantra() {
    if (this.isReading) {
      const currentMantra = this.mantras[this.currentIndex - 1];
      const pauseDuration = (currentMantra.pause || this.defaultPauseInSeconds) * 1000;
      this.timeoutId = setTimeout(() => this.readNextMantra(), pauseDuration);
    }
  }

  playBackgroundMusic() {
    if (this.selectedMusic) {
      this.backgroundMusicPlayer.src = BACKGROUND_MUSIC_SOURCES[this.selectedMusic];
      this.backgroundMusicPlayer.volume = 0.3;
      this.backgroundMusicPlayer.play();
    } else {
      this.backgroundMusicPlayer.pause();
    }
  }

  speakMantra(text, isRespeak = false) {
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'hu-HU';
    this.utterance.rate = this.speechRate;

    this.utterance.onend = () => {
      if (!isRespeak) this.scheduleNextMantra();
    };

    this.utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      if (!isRespeak && this.isReading) {
        this.scheduleNextMantra();
      }
    };

    this.speaker.speak(this.utterance);
  }

  readNextMantra() {
    if (!this.isReading) {
      this.mantraDisplay.textContent = UI_TEXTS.stopped;
      return;
    }

    if (this.currentIndex >= this.mantras.length) {
      this.stopReading();
      this.mantraDisplay.textContent = UI_TEXTS.finished;
      return;
    }

    const mantraData = this.mantras[this.currentIndex];
    this.mantraDisplay.textContent = mantraData.text;

    if (mantraData.audioSrc) {
      this.audioPlayer.src = mantraData.audioSrc;
      this.audioPlayer.play();
    } else {
      this.speakMantra(mantraData.text);
    }

    this.currentIndex++;
  }
}

customElements.define('autogen-mantra', AutogenMantra);