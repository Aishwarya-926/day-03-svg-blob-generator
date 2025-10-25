// --- DOM Element Selection ---
const svgContainer = document.getElementById('svg-container');
const complexitySlider = document.getElementById('complexity');
const complexityValue = document.getElementById('complexity-value');
const contrastSlider = document.getElementById('contrast');
const contrastValue = document.getElementById('contrast-value');
const regenerateBtn = document.getElementById('regenerate-btn');
const copyBtn = document.getElementById('copy-btn');
const svgOutput = document.getElementById('svg-output');

// --- Helper Functions ---

/**
 * Converts polar coordinates (angle, radius) to Cartesian coordinates (x, y).
 * This is the core of how we place points around a center.
 * @param {number} angle - The angle in degrees.
 * @param {number} radius - The distance from the center.
 * @returns {{x: number, y: number}} The Cartesian coordinates.
 */
function polarToCartesian(angle, radius) {
    const angleInRadians = (angle - 90) * Math.PI / 180; // Convert degrees to radians and offset by -90 degrees
    const x = 100 + (radius * Math.cos(angleInRadians)); // 100 is the center of our 200x200 SVG
    const y = 100 + (radius * Math.sin(angleInRadians));
    return { x, y };
}

/**
 * Describes the SVG path command for a cubic Bezier curve.
 * @param {object} p1 - Start point {x, y}.
 * @param {object} p2 - End point {x, y}.
 * @param {object} controlPoint1 - First control point {x, y}.
 * @param {object} controlPoint2 - Second control point {x, y}.
 * @returns {string} The SVG path command string.
 */
function cubicBezierCommand(p1, p2, controlPoint1, controlPoint2) {
    return `C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${p2.x},${p2.y}`;
}

// --- Core Blob Generation Logic ---

function generateBlob() {
    const complexity = parseInt(complexitySlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);
    
    complexityValue.textContent = complexity;
    contrastValue.textContent = contrast;

    const points = [];
    const angleStep = 360 / complexity;

    // 1. Generate distorted points
    for (let i = 0; i < complexity; i++) {
        const angle = angleStep * i;
        // The base radius is 80. We add a random value between -contrast and +contrast.
        const randomRadius = 80 + (Math.random() - 0.5) * contrast; 
        points.push(polarToCartesian(angle, randomRadius));
    }

    // 2. Build the SVG path string with smooth curves
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < complexity; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % complexity]; // The next point, looping back to the start

        // This is a simple way to create control points for a smooth curve.
        // We essentially place them along the line connecting the points.
        const controlPoint1 = polarToCartesian(angleStep * (i + 0.25), 80);
        const controlPoint2 = polarToCartesian(angleStep * (i + 0.75), 80);

        path += ` ${cubicBezierCommand(p1, p2, controlPoint1, controlPoint2)}`;
    }
    path += ' Z'; // Close the path

    // 3. Create the SVG element and update the UI
    const svgString = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="#3498db"></path></svg>`;
    
    svgContainer.innerHTML = svgString;
    svgOutput.value = svgString;
}

// --- Event Handlers ---

function copyToClipboard() {
    svgOutput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
}

// --- Event Listeners ---
complexitySlider.addEventListener('input', generateBlob);
contrastSlider.addEventListener('input', generateBlob);
regenerateBtn.addEventListener('click', generateBlob);
copyBtn.addEventListener('click', copyToClipboard);


// --- Initial Call ---
document.addEventListener('DOMContentLoaded', generateBlob);
