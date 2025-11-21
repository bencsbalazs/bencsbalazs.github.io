/**
 * Nonogram (Nanogram) game Web Component.
 * @class NonogramGrid
 * @extends HTMLElement
 */
class NonogramGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._puzzle = null;
    this._gridState = [];
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Sets the puzzle data for the game.
   * @param {number[][]} matrix - A 2D array of 0s and 1s representing the puzzle.
   */
  setPuzzle(matrix) {
    if (matrix && matrix.length > 0 && matrix[0].length > 0) {
      this._puzzle = matrix;
      this.rows = matrix.length;
      this.cols = matrix[0].length;
      this._gridState = Array(this.rows)
        .fill(null)
        .map(() => Array(this.cols).fill(0)); // 0: empty, 1: filled, 2: marked
      this.render();
    } else {
      console.error('Invalid puzzle data provided.');
    }
  }

  /**
   * Calculates the hints for rows and columns based on the puzzle matrix.
   * @returns {{rowHints: number[][], colHints: number[][]}} The calculated hints.
   */
  _calculateHints() {
    const getHints = (line) => {
      const hints = line
        .join('')
        .split('0')
        .map((group) => group.length)
        .filter((len) => len > 0);
      return hints.length > 0 ? hints : [0];
    };

    const rowHints = this._puzzle.map(getHints);

    const colHints = [];
    for (let c = 0; c < this.cols; c++) {
      const col = this._puzzle.map((row) => row[c]);
      colHints.push(getHints(col));
    }

    return { rowHints, colHints };
  }

  /**
   * Renders the entire component structure, including hints and the grid.
   */
  render() {
    if (!this._puzzle) {
      this.shadowRoot.innerHTML = '<p>Please set a puzzle.</p>';
      return;
    }

    const { rowHints, colHints } = this._calculateHints();

    const maxRowHints = Math.max(...rowHints.map((h) => h.length));
    const maxColHints = Math.max(...colHints.map((h) => h.length));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }
        .nonogram-container {
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto 1fr;
          border: 2px solid #333;
        }
        .corner {
          background-color: #f0f0f0;
        }
        .hints-col, .hints-row {
          display: flex;
          background-color: #f0f0f0;
        }
        .hints-col {
          grid-column: 2;
          grid-row: 1;
          border-left: 2px solid #333;
        }
        .hints-row {
          grid-column: 1;
          grid-row: 2;
          flex-direction: column;
          border-top: 2px solid #333;
        }
        .hint-block {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 4px;
          box-sizing: border-box;
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }
        .hints-col .hint-block {
          flex-direction: column;
          justify-content: flex-end;
          border-bottom: none;
          border-top: 1px solid #ccc;
        }
        .hints-row .hint-block {
           border-right: none;
           border-left: 1px solid #ccc;
        }
        .grid {
          grid-column: 2;
          grid-row: 2;
          display: grid;
          grid-template-columns: repeat(${this.cols}, 30px);
          grid-template-rows: repeat(${this.rows}, 30px);
          border-top: 2px solid #333;
          border-left: 2px solid #333;
          background-color: #eee;
        }
        .cell {
          width: 30px;
          height: 30px;
          box-sizing: border-box;
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          background-color: white;
          cursor: pointer;
          transition: background-color 0.1s;
          user-select: none;
        }
        .cell:hover {
          background-color: #e0e0e0;
        }
        .cell.filled {
          background-color: #333;
        }
        .cell.marked::after {
          content: '×';
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #777;
        }
      </style>
      <div class="nonogram-container">
        <div class="corner"></div>
        <div class="hints-col">
          ${colHints
            .map(
              (hints) =>
                `<div class="hint-block">${hints.map((h) => `<div>${h}</div>`).join('')}</div>`
            )
            .join('')}
        </div>
        <div class="hints-row">
          ${rowHints
            .map(
              (hints) =>
                `<div class="hint-block">${hints.map((h) => `<span>${h}</span>`).join(' ')}</div>`
            )
            .join('')}
        </div>
        <div class="grid">
          ${this._gridState
            .map((row, r) =>
              row
                .map((_, c) => `<div class="cell" data-row="${r}" data-col="${c}"></div>`)
                .join('')
            )
            .join('')}
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.grid').addEventListener('click', this._handleCellClick.bind(this));
  }

  /**
   * Handles click events on the grid cells.
   * @param {MouseEvent} event
   */
  _handleCellClick(event) {
    const cell = event.target;
    if (!cell.classList.contains('cell')) return;

    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);

    // Cycle through states: empty -> filled -> marked -> empty
    switch (this._gridState[row][col]) {
      case 0: // empty
        this._gridState[row][col] = 1;
        cell.classList.add('filled');
        break;
      case 1: // filled
        this._gridState[row][col] = 2;
        cell.classList.remove('filled');
        cell.classList.add('marked');
        break;
      case 2: // marked
        this._gridState[row][col] = 0;
        cell.classList.remove('marked');
        break;
    }

    this._checkSolution();
  }

  /**
   * Checks if the current grid state matches the puzzle solution.
   */
  _checkSolution() {
    let isSolved = true;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // The player's filled cells must match the puzzle's 1s.
        // Marked cells (2) are ignored for the solution check, but they must correspond to 0s in the puzzle.
        if (
          (this._gridState[r][c] === 1 && this._puzzle[r][c] !== 1) ||
          (this._gridState[r][c] !== 1 && this._puzzle[r][c] === 1)
        ) {
          isSolved = false;
          break;
        }
      }
      if (!isSolved) break;
    }

    if (isSolved) {
      // Add a small delay to allow the last cell to render before the alert.
      setTimeout(() => {
        alert('Congratulations! You solved the puzzle!');
        this.shadowRoot.querySelector('.grid').style.borderColor = 'green';
      }, 100);
    }
  }
}

customElements.define('nonogram-grid', NonogramGrid);
