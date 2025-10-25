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
 */
function polarToCartesian(angle, radius) {
    const angleInRadians = (angle - 90) * Math.PI / 180;
    const x = 100 + (radius * Math.cos(angleInRadians));
    const y = 100 + (radius * Math.sin(angleInRadians));
    return { x, y };
}

/**
 * Calculates the control points for a Catmull-Rom spline segment, which can be
 * converted to a cubic Bezier curve. This is the key to creating smooth, convex curves.
 * @param {object} p0 - Point before the start of the curve.
 *   {p1} - Start point of the curve.
 * @param {object} p2 - End point of the curve.
 *   {p3} - Point after the end of the curve.
 * @returns {object} An object containing the two control points.
 */
function catmullRomToBezier(p0, p1, p2, p3) {
    // The 'tension' parameter. 1/6 is a good default for a smooth curve.
    const tension = 1 / 6;

    const controlPoint1 = {
        x: p1.x + (p2.x - p0.x) * tension,
        y: p1.y + (p2.y - p0.y) * tension
    };
    const controlPoint2 = {
        x: p2.x - (p3.x - p1.x) * tension,
        y: p2.y - (p3.y - p1.y) * tension
    };

    return { controlPoint1, controlPoint2 };
}


// --- Core Blob Generation Logic ---

function generateBlob() {
    const complexity = parseInt(complexitySlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);
    
    complexityValue.textContent = complexity;
    contrastValue.textContent = contrast;

    const points = [];
    const angleStep = 360 / complexity;

    // 1. Generate distorted points (same as before)
    for (let i = 0; i < complexity; i++) {
        const angle = angleStep * i;
        // The base radius is 80. We add a random value between -contrast and +contrast.
        const randomRadius = 80 - contrast + Math.random() * contrast * 2;
        points.push(polarToCartesian(angle, randomRadius));
    }

    // 2. Build the SVG path string using the new, smarter curve calculation
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < complexity; i++) {
        // We need 4 points to define the curve between point i and point i+1.
        // The modulo operator (%) is crucial for wrapping around the array.
        const p0 = points[(i - 1 + complexity) % complexity];
        const p1 = points[i];
        const p2 = points[(i + 1) % complexity];
        const p3 = points[(i + 2) % complexity];

        // Calculate the control points using our new function
        const { controlPoint1, controlPoint2 } = catmullRomToBezier(p0, p1, p2, p3);

        // Append the cubic Bezier curve command to the path
        path += ` C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${p2.x},${p2.y}`;
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
    // Using navigator.clipboard for modern, secure copying
    navigator.clipboard.writeText(svgOutput.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}

// --- Event Listeners ---
complexitySlider.addEventListener('input', generateBlob);
contrastSlider.addEventListener('input', generateBlob);
regenerateBtn.addEventListener('click', generateBlob);
copyBtn.addEventListener('click', copyToClipboard);

// --- Initial Call ---
document.addEventListener('DOMContentLoaded', generateBlob);
