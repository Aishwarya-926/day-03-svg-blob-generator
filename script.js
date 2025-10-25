// --- DOM Element Selection ---
const svgContainer = document.getElementById('svg-container');
const complexitySlider = document.getElementById('complexity');
const complexityValue = document.getElementById('complexity-value');
const contrastSlider = document.getElementById('contrast');
const contrastValue = document.getElementById('contrast-value');
const regenerateBtn = document.getElementById('regenerate-btn');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const svgOutput = document.getElementById('svg-output');
const animateToggle = document.getElementById('animate-toggle');
const animationStyles = document.getElementById('animation-styles');

// --- State Management ---
let animationPaths = [];

// --- NEW: The Debounce Function ---
/**
 * Creates a debounced function that delays invoking `func` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {Function} Returns the new debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


// --- Core Blob Generation Logic (No changes here) ---

function polarToCartesian(angle, radius) {
    const angleInRadians = (angle - 90) * Math.PI / 180;
    const x = 100 + (radius * Math.cos(angleInRadians));
    const y = 100 + (radius * Math.sin(angleInRadians));
    return { x, y };
}

function catmullRomToBezier(p0, p1, p2, p3) {
    const tension = 1 / 6;
    const controlPoint1 = { x: p1.x + (p2.x - p0.x) * tension, y: p1.y + (p2.y - p0.y) * tension };
    const controlPoint2 = { x: p2.x - (p3.x - p1.x) * tension, y: p2.y - (p3.y - p1.y) * tension };
    return { controlPoint1, controlPoint2 };
}

function createBlobPath(complexity, contrast) {
    const points = [];
    const angleStep = 360 / complexity;
    for (let i = 0; i < complexity; i++) {
        const angle = angleStep * i;
        const randomRadius = 80 - contrast + Math.random() * contrast * 2;
        points.push(polarToCartesian(angle, randomRadius));
    }
    let path = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    for (let i = 0; i < complexity; i++) {
        const p0 = points[(i - 1 + complexity) % complexity];
        const p1 = points[i];
        const p2 = points[(i + 1) % complexity];
        const p3 = points[(i + 2) % complexity];
        const { controlPoint1, controlPoint2 } = catmullRomToBezier(p0, p1, p2, p3);
        path += ` C ${controlPoint1.x.toFixed(2)},${controlPoint1.y.toFixed(2)} ${controlPoint2.x.toFixed(2)},${controlPoint2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    path += ' Z';
    return path;
}

// --- Main Application Logic ---

function generateAndRender() {
    console.log("Generating frames..."); // For debugging
    const complexity = parseInt(complexitySlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);
    
    complexityValue.textContent = complexity;
    contrastValue.textContent = contrast;
    
    animationPaths = [];
    const numFrames = 20;
    for (let i = 0; i < numFrames; i++) {
        animationPaths.push(createBlobPath(complexity, contrast));
    }
    
    renderPreview(animationPaths[0]);
    updateAnimationKeyframes();
}

function renderPreview(pathData) {
    const svgString = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" fill="#3498db"></path></svg>`;
    svgContainer.innerHTML = svgString;
    svgOutput.value = svgContainer.innerHTML;
    if (animateToggle.checked) {
        toggleAnimation(true);
    }
}

function updateAnimationKeyframes() {
    let keyframes = "@keyframes morph {\n";
    const step = 100 / animationPaths.length;
    animationPaths.forEach((path, index) => {
        const percentage = Math.round(step * index);
        keyframes += `  ${percentage}% { d: "${path}"; }\n`;
    });
    keyframes += `  100% { d: "${animationPaths[0]}"; }\n`;
    keyframes += "}";
    animationStyles.innerHTML = keyframes;
}

function toggleAnimation(shouldAnimate) {
    const pathElement = svgContainer.querySelector('path');
    if (pathElement) {
        pathElement.classList.toggle('is-animating', shouldAnimate);
    }
}

function createAnimatedSVGFile() {
    const values = animationPaths.join('; ') + `; ${animationPaths[0]}`;
    const numFrames = animationPaths.length;
    const keyTimes = Array.from({ length: numFrames + 1 }, (_, i) => (i / numFrames).toFixed(3)).join('; ');
    const svgFileContent = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path fill="#3498db" d="${animationPaths[0]}">
    <animate 
      attributeName="d" 
      dur="4s" 
      repeatCount="indefinite"
      keyTimes="${keyTimes}"
      values="${values}">
    </animate>
  </path>
</svg>`;
    return svgFileContent.trim();
}

// --- Event Handlers ---

function handleSaveAnimation() {
    if (animationPaths.length === 0) {
        console.error("No animation paths to save!");
        return;
    }
    const svgData = createAnimatedSVGFile();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animated-blob.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    svgOutput.select();
    navigator.clipboard.writeText(svgOutput.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Static Code'; }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}

// --- Event Listeners ---

// Create the debounced version of our expensive function
const debouncedGenerateAndRender = debounce(generateAndRender, 250);

// Use the debounced function for the sliders
complexitySlider.addEventListener('input', debouncedGenerateAndRender);
contrastSlider.addEventListener('input', debouncedGenerateAndRender);

// Use the normal function for clicks, which don't need debouncing
regenerateBtn.addEventListener('click', generateAndRender);

// The rest of the listeners are fine
copyBtn.addEventListener('click', copyToClipboard);
saveBtn.addEventListener('click', handleSaveAnimation);
animateToggle.addEventListener('change', (e) => toggleAnimation(e.target.checked));

// --- Initial Call ---
document.addEventListener('DOMContentLoaded', generateAndRender);
