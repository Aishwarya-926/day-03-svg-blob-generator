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
let animationPaths = []; // Will store the 'd' attribute for each animation frame

// --- Core Blob Generation Logic ---

function polarToCartesian(angle, radius) { /* ... (no changes) ... */ }
function catmullRomToBezier(p0, p1, p2, p3) { /* ... (no changes) ... */ }

// --- REFACTORED: This function is now a "pure" function ---
// It only calculates and returns a path string, without touching the DOM.
function createBlobPath(complexity, contrast) {
    const points = [];
    const angleStep = 360 / complexity;

    for (let i = 0; i < complexity; i++) {
        const angle = angleStep * i;
        const randomRadius = 80 - contrast + Math.random() * contrast * 2;
        points.push(polarToCartesian(angle, randomRadius));
    }

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < complexity; i++) {
        const p0 = points[(i - 1 + complexity) % complexity];
        const p1 = points[i];
        const p2 = points[(i + 1) % complexity];
        const p3 = points[(i + 2) % complexity];
        const { controlPoint1, controlPoint2 } = catmullRomToBezier(p0, p1, p2, p3);
        path += ` C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${p2.x},${p2.y}`;
    }
    path += ' Z';
    return path;
}

// --- NEW: Generates all frames for the animation ---
function generateAnimationFrames() {
    const complexity = parseInt(complexitySlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);
    
    complexityValue.textContent = complexity;
    contrastValue.textContent = contrast;
    
    animationPaths = []; // Reset the frames
    const numFrames = 20;
    for (let i = 0; i < numFrames; i++) {
        animationPaths.push(createBlobPath(complexity, contrast));
    }
    
    // Update the preview with the first frame
    renderPreview(animationPaths[0]);
    // Update the dynamic stylesheet for the animation preview
    updateAnimationKeyframes();
}

// --- NEW: Renders the SVG in the preview panel ---
function renderPreview(pathData) {
    const svgString = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" fill="#3498db"></path></svg>`;
    svgContainer.innerHTML = svgString;
    svgOutput.value = svgContainer.innerHTML; // Update static code output
}

// --- NEW: Injects CSS Keyframes into the document head ---
function updateAnimationKeyframes() {
    let keyframes = "@keyframes morph {\n";
    const step = 100 / (animationPaths.length - 1);
    
    animationPaths.forEach((path, index) => {
        // We include the first frame again at the end for a smooth loop
        const percentage = index === animationPaths.length ? 100 : Math.round(step * index);
        keyframes += `  ${percentage}% { d: "${path}"; }\n`;
    });
    // Add the first frame at the end to complete the loop smoothly
    keyframes += `  100% { d: "${animationPaths[0]}"; }\n`;
    keyframes += "}";
    
    animationStyles.innerHTML = keyframes;
}

// --- NEW: Toggles the animation class on the SVG path ---
function toggleAnimation(shouldAnimate) {
    const pathElement = svgContainer.querySelector('path');
    if (pathElement) {
        if (shouldAnimate) {
            pathElement.classList.add('is-animating');
        } else {
            pathElement.classList.remove('is-animating');
        }
    }
}

// --- NEW: Creates the content for the downloadable animated SVG file ---
function createAnimatedSVGFile() {
    const values = animationPaths.join('; ') + `; ${animationPaths[0]}`;
    const svgFileContent = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path fill="#3498db" d="${animationPaths[0]}">
    <animate 
      attributeName="d" 
      dur="4s" 
      repeatCount="indefinite" 
      values="${values}">
    </animate>
  </path>
</svg>`;
    return svgFileContent.trim();
}

// --- Event Handlers ---
function handleSaveAnimation() {
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

function copyToClipboard() { /* ... (no changes) ... */ }

// --- Event Listeners ---
complexitySlider.addEventListener('input', generateAnimationFrames);
contrastSlider.addEventListener('input', generateAnimationFrames);
regenerateBtn.addEventListener('click', generateAnimationFrames);
copyBtn.addEventListener('click', copyToClipboard);
saveBtn.addEventListener('click', handleSaveAnimation);
animateToggle.addEventListener('change', (e) => toggleAnimation(e.target.checked));

// --- Initial Call ---
document.addEventListener('DOMContentLoaded', generateAnimationFrames);

// Helper function stubs (paste the full functions from the previous day)
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

function copyToClipboard() {
    svgOutput.select();
    navigator.clipboard.writeText(svgOutput.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Static Code'; }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}
