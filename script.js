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

// --- The Debounce Function (Essential for performance) ---
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
function polarToCartesian(angle, radius) { /* ... */ }
function catmullRomToBezier(p0, p1, p2, p3) { /* ... */ }
function createBlobPath(complexity, contrast) { /* ... */ }

// --- Main Application Logic ---

function generateAndRender() {
    const complexity = parseInt(complexitySlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);
    
    complexityValue.textContent = complexity;
    contrastValue.textContent = contrast;
    
    animationPaths = [];
    const numFrames = 20;
    for (let i = 0; i < numFrames; i++) {
        animationPaths.push(createBlobPath(complexity, contrast));
    }
    
    // --- FIX #1: THE ORDER OF OPERATIONS IS CRITICAL ---
    // Update the CSS rules *before* you update the DOM element.
    updateAnimationKeyframes();
    renderPreview(animationPaths[0]);
}

function renderPreview(pathData) {
    const svgString = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" fill="#3498db"></path></svg>`;
    svgContainer.innerHTML = svgString;
    svgOutput.value = svgContainer.innerHTML;
    
    // If the toggle is on, ensure the new element gets animated.
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

// --- FIX #2: THE RESTART "TRICK" ---
function toggleAnimation(shouldAnimate) {
    const pathElement = svgContainer.querySelector('path');
    if (!pathElement) return;

    // First, always remove the class to ensure we can restart the animation.
    pathElement.classList.remove('is-animating');

    if (shouldAnimate) {
        // This is the magic "reflow" trick. Accessing a layout property like
        // offsetHeight forces the browser to re-calculate the styles.
        // It ensures the .remove('is-animating') is processed before we add it back.
        void pathElement.offsetHeight; 

        // Now, add the class back. The browser sees this as a "new" animation
        // and will correctly use the latest @keyframes.
        pathElement.classList.add('is-animating');
    }
}


function createAnimatedSVGFile() { /* ... (no changes) ... */ }
function handleSaveAnimation() { /* ... (no changes) ... */ }
function copyToClipboard() { /* ... (no changes) ... */ }

// --- Event Listeners ---
const debouncedGenerateAndRender = debounce(generateAndRender, 250);
complexitySlider.addEventListener('input', debouncedGenerateAndRender);
contrastSlider.addEventListener('input', debouncedGenerateAndRender);
regenerateBtn.addEventListener('click', generateAndRender);
copyBtn.addEventListener('click', copyToClipboard);
saveBtn.addEventListener('click', handleSaveAnimation);
animateToggle.addEventListener('change', (e) => toggleAnimation(e.target.checked));

// --- Initial Call ---
document.addEventListener('DOMContentLoaded', generateAndRender);

// --- PASTE THE FULL HELPER FUNCTIONS HERE ---
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
function handleSaveAnimation() {
    if (animationPaths.length === 0) { return; }
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
