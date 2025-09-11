class PiCalculator extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="container">
                
                    <div class="row">
                        <div class="col-md-4">
                            <h5 class="card-title">Follow these steps:</h5>
                            <ol class="list-group list-group-numbered">
                                <li class="list-group-item">Draw a square and an inscribed circle.</li>
                                <li class="list-group-item">Generate random points within the square.</li>
                                <li class="list-group-item">Count points that fall inside the circle.</li>
                                <li class="list-group-item">Calculate Pi based on the ratio.</li>
                            </ol>
                        </div>
                        <div class="col-md-4">
                            <h5 class="card-title">Try a calculation:</h5>
                            <div class="text-center">
                                <div class="alert alert-info">
                                    <p id="pointCount" class="h5">Points: 0 / 100</p>
                                    <p id="piEstimate" class="h5 text-success">Pi Estimate: Calculating...</p>
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text">Number of Points:</span>
                                    <input type="number" id="numPoints" value="100" min="10" max="10000" class="form-control">
                                    <button id="startButton" class="btn btn-primary">
                                        Start Animation
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <canvas id="piCanvas" class="w-100" width="300" height="300" style="background-color: #f8f9fa; border-radius: 0.25rem; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);"></canvas>
                        </div>
                    </div>
            </div>
        `;

        this.appendChild(template.content.cloneNode(true));

        this.canvas = this.querySelector('#piCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pointCountElement = this.querySelector('#pointCount');
        this.piEstimateElement = this.querySelector('#piEstimate');
        this.numPointsInput = this.querySelector('#numPoints');
        this.startButton = this.querySelector('#startButton');

        this.totalPoints = parseInt(this.numPointsInput.value);
        this.pointsInCircle = 0;
        this.totalGeneratedPoints = 0;

        this.size = this.canvas.width;
        this.radius = this.size / 2;
        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.animationFrameId = null;

        this.startButton.addEventListener('click', () => this.startAnimation());
        this.drawShapes();
    }

    drawShapes() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.size, this.size);
        this.ctx.strokeStyle = '#6c757d';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#198754';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    generatePoint() {
        if (this.totalGeneratedPoints >= this.totalPoints) {
            cancelAnimationFrame(this.animationFrameId);
            this.startButton.disabled = false;
            return;
        }

        this.totalGeneratedPoints++;

        const x = Math.random() * this.size;
        const y = Math.random() * this.size;

        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distanceSquared = dx * dx + dy * dy;

        const inCircle = distanceSquared <= this.radius * this.radius;

        if (inCircle) {
            this.pointsInCircle++;
            this.ctx.fillStyle = 'rgba(25, 135, 84, 0.5)'; // Green
        } else {
            this.ctx.fillStyle = 'rgba(220, 53, 69, 0.5)'; // Red
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
        this.ctx.fill();

        this.pointCountElement.textContent = `Points: ${this.totalGeneratedPoints} / ${this.totalPoints}`;

        const piEstimate = 4 * (this.pointsInCircle / this.totalGeneratedPoints);
        this.piEstimateElement.textContent = `Pi Estimate: ${piEstimate.toFixed(5)}`;

        this.animationFrameId = requestAnimationFrame(() => this.generatePoint());
    }

    startAnimation() {
        this.totalPoints = parseInt(this.numPointsInput.value);
        this.pointsInCircle = 0;
        this.totalGeneratedPoints = 0;
        this.startButton.disabled = true;
        this.drawShapes();
        this.generatePoint();
    }
}

customElements.define('montecarlo-pi-calculator', PiCalculator);