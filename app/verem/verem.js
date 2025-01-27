const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();

function drawMe(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x, y + 30);
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x - 10, y + 25);
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x + 10, y + 25);
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x - 10, y + 40);
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x + 10, y + 40);
    ctx.stroke();

    ctx.font = "16px Arial";
    ctx.fillText("ME", 80, 70);
}

const drawStep = (xPoint, yPoint, label) => {
    ctx.beginPath();
    ctx.arc(xPoint, yPoint, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`P${label}`, xPoint + 30, yPoint);

    canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const distance = Math.sqrt((mouseX - xPoint) ** 2 + (mouseY - yPoint) ** 2);

        if (distance <= 5) {
            hovered = true;
            canvas.style.cursor = "pointer";
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(xPoint, yPoint, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        } else {
            if (hovered) {
                hovered = false;
                canvas.style.cursor = "default";
                drawStep(xPoint, yPoint, label);
            }
        }
    });

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const distance = Math.sqrt((mouseX - xPoint) ** 2 + (mouseY - yPoint) ** 2);

        if (distance <= 5) {
            alert(`You clicked on ${label}`);
        }
    });
}

function calculateXForY(y, a, b, c) {
    const adjustedC = c - y;
    const discriminant = b ** 2 - 4 * a * adjustedC;
    if (discriminant < 0) {
        return null;
    }
    return (-b - Math.sqrt(discriminant)) / (2 * a);
}


const drawParabola = (p1, p2, p3) => {
    const matrix = [
        [p1.x ** 2, p1.x, 1, p1.y],
        [p2.x ** 2, p2.x, 1, p2.y],
        [p3.x ** 2, p3.x, 1, p3.y]
    ];

    const { a, b, c } = gaussElimination(matrix);
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const y = a * x ** 2 + b * x + c;
        if (y > 100) {
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    const segmentCount = 15;
    const step = (p3.x - p2.x) / (segmentCount - 1);
    const y_step = (p3.y - p2.y) / (segmentCount - 1);

    for (let i = 0; i < segmentCount; i++) {
        if (i === 0 || i === segmentCount - 1) {
            continue;
        }
        const x = p2.x + i * step;
        const y = p2.y + i * y_step;

        drawStep(calculateXForY(y, a, b, c), y, i);
    }
}

function drawArrow(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y - 20);
    ctx.moveTo(x, y);
    ctx.lineTo(x - 20, y - 20);
    ctx.stroke();
}

function drawCar(x, y) {
    ctx.beginPath();
    ctx.rect(x, y, 50, 20);
    ctx.arc(x + 10, y + 20, 5, 0, 2 * Math.PI);
    ctx.arc(x + 40, y + 20, 5, 0, 2 * Math.PI);
    ctx.stroke();
}

drawDeathPoint = (x, y) => {
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 15, 0, 2 * Math.PI);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y + 20);
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
    ctx.font = "12px Arial";
    ctx.fillText("HALÁL", x + 30, y + 15);
}

drawPlans = () => {
    ctx.font = "16px Arial";
    ctx.fillText("TERVEK", rect.width * 0.8, rect.height * 0.1);
    ctx.moveTo(rect.width * 0.8, rect.height * 0.12);
    ctx.lineTo(rect.width * 0.86, rect.height * 0.12);
    ctx.moveTo(rect.width * 0.8, rect.height * 0.14);
    ctx.lineTo(rect.width * 0.86, rect.height * 0.14);
    ctx.moveTo(rect.width * 0.8, rect.height * 0.16);
    ctx.lineTo(rect.width * 0.86, rect.height * 0.16);
    ctx.stroke();
}



function drawGround() {
    ctx.beginPath();
    ctx.moveTo(0, rect.height * 0.2);
    ctx.lineTo(rect.width * 0.2, rect.height * 0.2);
    ctx.moveTo(rect.width * 0.8, rect.height * 0.2);
    ctx.lineTo(rect.width, rect.height * 0.2);
    ctx.stroke();
}

// Here we start drawing the scene
drawDeathPoint(rect.width * 0.5 - 10, rect.height * 0.9 + 10);

function addKeyListener(functions) {
    let currentIndex = 0;
    document.addEventListener("keydown", (event) => {
        if (event.key === "n") {
            if (currentIndex < functions.length) {
                functions[currentIndex]();
                currentIndex++;
            }
        }
    });
}

const functionsList = [
    () => drawGround(),
    () => drawMe(rect.width * 0.5, rect.height * 0.9),
    () => drawParabola(
        { x: rect.width * 0.2, y: rect.height * 0.2 },
        { x: rect.width * 0.5, y: rect.height * 0.9 },
        { x: rect.width * 0.8, y: rect.height * 0.2 }
    ),
    () => alert("Step 2: Add another functionality here!"),
    () => alert("Step 3: Add yet another functionality here!")
];

addKeyListener(functionsList);


displayMousePosition = (x, y) => {
    document.getElementById("mousePosition").innerHTML = `Mouse Position: (${x}, ${y})`;
}
canvas.addEventListener("mousemove", (event) => {
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    displayMousePosition(mouseX, mouseY);
});
