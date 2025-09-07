// DOM elements
let uploadButton, imageUpload, originalCanvas, processedCanvas;
let processButton, resetButton, originalStats, processedStats;
let processingTime, intensitySlider, intensityValue, filterButtons;
let sample1Button, sample2Button;

// Canvas context
let originalCtx, processedCtx;

// State variables
let originalImageData = null;
let currentFilter = 'grayscale';

// Initialize the application
export function initFilters() {
    // Get DOM elements
    uploadButton = document.getElementById('uploadButton');
    imageUpload = document.getElementById('imageUpload');
    originalCanvas = document.getElementById('originalCanvas');
    processedCanvas = document.getElementById('processedCanvas');
    processButton = document.getElementById('processButton');
    resetButton = document.getElementById('resetButton');
    originalStats = document.getElementById('originalStats');
    processedStats = document.getElementById('processedStats');
    processingTime = document.getElementById('processingTime');
    intensitySlider = document.getElementById('intensity');
    intensityValue = document.getElementById('intensityValue');
    filterButtons = document.querySelectorAll('.filter-button');
    sample1Button = document.getElementById('sample1');
    sample2Button = document.getElementById('sample2');
    
    // Canvas context
    originalCtx = originalCanvas.getContext('2d');
    processedCtx = processedCanvas.getContext('2d');
    
    // Event listeners
    uploadButton.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    processButton.addEventListener('click', processImage);
    resetButton.addEventListener('click', resetImage);
    intensitySlider.addEventListener('input', updateIntensityValue);
    sample1Button.addEventListener('click', () => loadSampleImage(1));
    sample2Button.addEventListener('click', () => loadSampleImage(2));
    
    // Filter selection
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
        });
    });
    
    // Initialize intensity value
    updateIntensityValue();
    
    // Load a default sample image on page load
    loadSampleImage(1);
}

// Functions
function updateIntensityValue() {
    intensityValue.textContent = intensitySlider.value;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            drawImageToCanvas(img, originalCanvas, originalCtx);
            originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            updateImageStats(originalStats, originalCanvas, 'Original');
            resetProcessedCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function loadSampleImage(number) {
    const img = new Image();
    img.onload = function() {
        drawImageToCanvas(img, originalCanvas, originalCtx);
        originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        updateImageStats(originalStats, originalCanvas, 'Original');
        resetProcessedCanvas();
    };
    img.src = `assets/img/samples/sample${number}.jpg`;
}

function drawImageToCanvas(img, canvas, ctx) {
    // Calculate dimensions to fit in canvas while maintaining aspect ratio
    const maxWidth = 600;
    const maxHeight = 400;
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    
    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, height);
}

function resetProcessedCanvas() {
    processedCanvas.width = originalCanvas.width;
    processedCanvas.height = originalCanvas.height;
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedStats.textContent = `Dimensions: 0 x 0 | Filter: None`;
}

function updateImageStats(statsElement, canvas, type) {
    const sizeKB = (canvas.width * canvas.height * 4) / 1024;
    statsElement.textContent = `Dimensions: ${canvas.width} x ${canvas.height} | Size: ${sizeKB.toFixed(2)} KB`;
}

function resetImage() {
    if (originalImageData) {
        originalCtx.putImageData(originalImageData, 0, 0);
        resetProcessedCanvas();
    }
}

function processImage() {
    if (!originalImageData) return;
    
    // Simulate WebAssembly processing with a JavaScript implementation
    // In a real scenario, this would call WebAssembly functions compiled from Rust/C++
    const startTime = performance.now();
    
    // Copy original image data
    const width = originalCanvas.width;
    const height = originalCanvas.height;
    const processedData = new ImageData(width, height);
    
    // Get intensity value
    const intensity = parseInt(intensitySlider.value);
    
    // Apply selected filter
    switch(currentFilter) {
        case 'grayscale':
            applyGrayscale(originalImageData, processedData);
            break;
        case 'blur':
            applyBlur(originalImageData, processedData, intensity);
            break;
        case 'edges':
            applyEdgeDetection(originalImageData, processedData, intensity);
            break;
        case 'sharpen':
            applySharpen(originalImageData, processedData, intensity);
            break;
        case 'invert':
            applyInvert(originalImageData, processedData);
            break;
        case 'emboss':
            applyEmboss(originalImageData, processedData, intensity);
            break;
    }
    
    // Display processing time
    const endTime = performance.now();
    processingTime.textContent = (endTime - startTime).toFixed(2);
    
    // Draw processed image
    processedCanvas.width = width;
    processedCanvas.height = height;
    processedCtx.putImageData(processedData, 0, 0);
    
    // Update stats
    processedStats.textContent = `Dimensions: ${width} x ${height} | Filter: ${currentFilter}`;
}

// Filter implementations (simulating what would be done in WebAssembly)
function applyGrayscale(input, output) {
    const data = input.data;
    const outputData = output.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        outputData[i] = avg;
        outputData[i + 1] = avg;
        outputData[i + 2] = avg;
        outputData[i + 3] = data[i + 3];
    }
}

function applyBlur(input, output, intensity) {
    const data = input.data;
    const outputData = output.data;
    const width = input.width;
    const height = input.height;
    
    // Simple box blur implementation
    const radius = Math.floor(intensity / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        a += data[idx + 3];
                        count++;
                    }
                }
            }
            
            const idx = (y * width + x) * 4;
            outputData[idx] = r / count;
            outputData[idx + 1] = g / count;
            outputData[idx + 2] = b / count;
            outputData[idx + 3] = a / count;
        }
    }
}

function applyEdgeDetection(input, output, intensity) {
    // Simple Sobel operator implementation
    const data = input.data;
    const outputData = output.data;
    const width = input.width;
    const height = input.height;
    
    // Convert to grayscale first
    const grayData = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            grayData[y * width + x] = data[idx] * 0.3 + data[idx + 1] * 0.59 + data[idx + 2] * 0.11;
        }
    }
    
    // Apply Sobel operator
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const gx = 
                -grayData[(y-1)*width + (x-1)] + grayData[(y-1)*width + (x+1)] +
                -2 * grayData[y*width + (x-1)] + 2 * grayData[y*width + (x+1)] +
                -grayData[(y+1)*width + (x-1)] + grayData[(y+1)*width + (x+1)];
            
            const gy = 
                -grayData[(y-1)*width + (x-1)] - 2 * grayData[(y-1)*width + x] - grayData[(y-1)*width + (x+1)] +
                grayData[(y+1)*width + (x-1)] + 2 * grayData[(y+1)*width + x] + grayData[(y+1)*width + (x+1)];
            
            const magnitude = Math.min(255, Math.sqrt(gx*gx + gy*gy) * intensity);
            
            const idx = (y * width + x) * 4;
            outputData[idx] = magnitude;
            outputData[idx + 1] = magnitude;
            outputData[idx + 2] = magnitude;
            outputData[idx + 3] = 255;
        }
    }
}

function applySharpen(input, output, intensity) {
    // Simple sharpen implementation using convolution
    const data = input.data;
    const outputData = output.data;
    const width = input.width;
    const height = input.height;
    
    const factor = intensity / 10;
    const kernel = [
        0, -1, 0,
        -1, 5 + factor, -1,
        0, -1, 0
    ];
    
    applyConvolution(data, outputData, width, height, kernel);
}

function applyInvert(input, output) {
    const data = input.data;
    const outputData = output.data;
    
    for (let i = 0; i < data.length; i += 4) {
        outputData[i] = 255 - data[i];
        outputData[i + 1] = 255 - data[i + 1];
        outputData[i + 2] = 255 - data[i + 2];
        outputData[i + 3] = data[i + 3];
    }
}

function applyEmboss(input, output, intensity) {
    // Emboss filter implementation
    const data = input.data;
    const outputData = output.data;
    const width = input.width;
    const height = input.height;
    
    const kernel = [
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2
    ];
    
    applyConvolution(data, outputData, width, height, kernel);
    
    // Adjust contrast based on intensity
    const factor = 1 + (intensity / 10);
    for (let i = 0; i < outputData.length; i += 4) {
        outputData[i] = Math.min(255, Math.max(0, (outputData[i] - 128) * factor + 128));
        outputData[i + 1] = Math.min(255, Math.max(0, (outputData[i + 1] - 128) * factor + 128));
        outputData[i + 2] = Math.min(255, Math.max(0, (outputData[i + 2] - 128) * factor + 128));
    }
}

function applyConvolution(input, output, width, height, kernel) {
    const side = Math.round(Math.sqrt(kernel.length));
    const half = Math.floor(side / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const r = [0, 0, 0];
            
            for (let ky = 0; ky < side; ky++) {
                for (let kx = 0; kx < side; kx++) {
                    const cy = y + ky - half;
                    const cx = x + kx - half;
                    
                    if (cy >= 0 && cy < height && cx >= 0 && cx < width) {
                        const cidx = (cy * width + cx) * 4;
                        const kidx = ky * side + kx;
                        
                        r[0] += input[cidx] * kernel[kidx];
                        r[1] += input[cidx + 1] * kernel[kidx];
                        r[2] += input[cidx + 2] * kernel[kidx];
                    }
                }
            }
            
            const idx = (y * width + x) * 4;
            output[idx] = Math.min(255, Math.max(0, r[0]));
            output[idx + 1] = Math.min(255, Math.max(0, r[1]));
            output[idx + 2] = Math.min(255, Math.max(0, r[2]));
            output[idx + 3] = input[idx + 3];
        }
    }
}