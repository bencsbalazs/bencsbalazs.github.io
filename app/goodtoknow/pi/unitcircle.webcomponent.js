class CircleAnimator extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                <style>
                    canvas {
                        border: 2px solid #6c757d;
                        background-color: #343a40;
                        border-radius: 50%;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
                        touch-action: none; /* Prevent default touch behavior */
                    }
                    .info-box {
                        background-color: #495057;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        width: 100%;
                    }
                </style>
                <div class="d-flex flex-column flex-md-row align-items-center justify-content-center p-4 bg-secondary rounded-3 shadow-lg w-100" style="max-width: 900px;">
                    <div class="position-relative me-md-4 mb-4 mb-md-0" style="width: 384px; height: 384px;">
                        <canvas id="circleCanvas" width="500" height="500" class="w-100 h-100"></canvas>
                        <!-- Koordináta feliratok -->
                        <span class="position-absolute fs-6 text-muted" style="top:50%; left:50%; transform: translate(-100%, -150%);">(-1, 0)</span>
                        <span class="position-absolute fs-6 text-muted" style="top:50%; left:50%; transform: translate(0, -150%);">(1, 0)</span>
                        <span class="position-absolute fs-6 text-muted" style="top:50%; left:50%; transform: translate(-50%, -220%);">(0, 1)</span>
                        <span class="position-absolute fs-6 text-muted" style="top:50%; left:50%; transform: translate(-50%, 120%);">(0, -1)</span>
                    </div>

                    <div class="text-center text-md-start space-y-4 d-flex flex-column align-items-center">
                        <h1 class="fs-2 fw-bold mb-3">Egységkör Animáció</h1>
                        <div class="info-box">
                            <p id="angleDisplay" class="fs-5 fw-semibold text-info">Szög: 0°</p>
                            <p id="cosDisplay" class="fs-5 fw-semibold text-success">cos(θ): 1.00</p>
                            <p id="sinDisplay" class="fs-5 fw-semibold text-purple">sin(θ): 0.00</p>
                            <p id="tanDisplay" class="fs-5 fw-semibold text-danger">tan(θ): 0.00</p>
                            
                            <hr class="my-3 border-dark" />
                            
                            <p id="acosDisplay" class="fs-6 fw-medium text-success">acos(x): 0°</p>
                            <p id="asinDisplay" class="fs-6 fw-medium text-purple">asin(y): 0°</p>
                            <p id="atanDisplay" class="fs-6 fw-medium text-danger">atan(y/x): 0°</p>

                            <hr class="my-3 border-dark" />

                            <p class="text-muted small mb-2">Képletek:</p>
                            <p class="text-light small">$$\theta = \arccos(x)$$</p>
                            <p class="text-light small">$$\theta = \arcsin(y)$$</p>
                            <p class="text-light small">$$\theta = \arctan(\frac{y}{x})$$</p>
                        </div>
                        <p class="text-muted small mt-2">Kattintson vagy húzza az egeret a körön az interaktív vezérléshez!</p>
                    </div>
                </div>
                `;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.canvas = this.shadowRoot.getElementById('circleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.angleDisplay = this.shadowRoot.getElementById('angleDisplay');
        this.cosDisplay = this.shadowRoot.getElementById('cosDisplay');
        this.sinDisplay = this.shadowRoot.getElementById('sinDisplay');
        this.tanDisplay = this.shadowRoot.getElementById('tanDisplay');
        this.acosDisplay = this.shadowRoot.getElementById('acosDisplay');
        this.asinDisplay = this.shadowRoot.getElementById('asinDisplay');
        this.atanDisplay = this.shadowRoot.getElementById('atanDisplay');

        this.size = this.canvas.width;
        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.radius = this.size / 2 - 20;
        this.angle = 0; // Initial angle in radians
        this.animationFrameId = null;
        this.isDragging = false;

        // Mouse and touch event handlers
        this.canvas.addEventListener('mousedown', this.handleInteractionStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleInteractionMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleInteractionEnd.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleInteractionEnd.bind(this));
        this.canvas.addEventListener('touchstart', this.handleInteractionStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleInteractionMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleInteractionEnd.bind(this));
    }

    connectedCallback() {
        this.animate();
    }

    disconnectedCallback() {
        cancelAnimationFrame(this.animationFrameId);
    }

    handleInteractionStart(e) {
        this.isDragging = true;
        this.updateAngle(e);
    }

    handleInteractionMove(e) {
        if (this.isDragging) {
            this.updateAngle(e);
        }
    }

    handleInteractionEnd() {
        this.isDragging = false;
    }

    updateAngle(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches ? e.touches[0].clientX : 0)) - rect.left - this.centerX;
        const y = (e.clientY || (e.touches ? e.touches[0].clientY : 0)) - rect.top - this.centerY;

        // Invert the y-axis for the correct angle value
        this.angle = Math.atan2(y, x);

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.size, this.size);

        // Draw circle and axes
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#adb5bd';
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.size);
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.size, this.centerY);
        this.ctx.strokeStyle = '#6c757d';
        this.ctx.stroke();

        // Draw radius line
        const x = this.centerX + this.radius * Math.cos(this.angle);
        const y = this.centerY + this.radius * Math.sin(this.angle);

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = '#0dcaf0';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw helper lines (sin, cos)
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.centerY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = '#198754'; // cos green
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, y);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = '#6f42c1'; // sin purple
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Draw point at the end of the radius
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#dc3545';
        this.ctx.fill();

        // Draw tangent line
        if (Math.abs(Math.cos(this.angle)) > 0.01) {
            const tanX = this.centerX + this.radius;
            const tanY = this.centerY - this.radius * Math.tan(this.angle);

            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(this.centerX + this.radius * 2, tanY);
            this.ctx.strokeStyle = 'rgba(255, 99, 71, 0.5)';
            this.ctx.stroke();

            // Draw line to the tangent value
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX + this.radius, this.centerY);
            this.ctx.lineTo(tanX, tanY);
            this.ctx.strokeStyle = '#dc3545'; // Red
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.updateDisplays();
    }

    updateDisplays() {
        const degrees = (this.angle * 180 / Math.PI) % 360;
        const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
        const cosValue = Math.cos(this.angle);
        const sinValue = Math.sin(this.angle);
        const tanValue = Math.tan(this.angle);

        // Calculate inverse functions
        const acosValue = Math.acos(cosValue);
        const asinValue = Math.asin(sinValue);
        const atanValue = Math.atan2(sinValue, cosValue);

        this.angleDisplay.textContent = `Szög: ${normalizedDegrees.toFixed(0)}°`;
        this.cosDisplay.textContent = `cos(θ): ${cosValue.toFixed(3)}`;
        this.sinDisplay.textContent = `sin(θ): ${sinValue.toFixed(3)}`;
        this.tanDisplay.textContent = `tan(θ): ${Math.abs(tanValue) > 100 ? 'Infinity' : tanValue.toFixed(3)}`;

        this.acosDisplay.textContent = `acos(${cosValue.toFixed(3)}): ${(acosValue * 180 / Math.PI).toFixed(0)}°`;
        this.asinDisplay.textContent = `asin(${sinValue.toFixed(3)}): ${(asinValue * 180 / Math.PI).toFixed(0)}°`;
        this.atanDisplay.textContent = `atan(${tanValue.toFixed(3)}): ${(atanValue * 180 / Math.PI).toFixed(0)}°`;
    }

    animate() {
        if (!this.isDragging) {
            this.angle += 0.01;
            this.draw();
        }
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

customElements.define('circle-animator', CircleAnimator);