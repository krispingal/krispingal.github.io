let mainCanvas;
let breathCycle = 0;
let breathSpeed = 0.03; // Very slow breath speed
let canvasContainer;

function setup() {
  // Get the container element dimensions
  canvasContainer = document.getElementById('background-canvas-container');
  
  // Create canvas inside the specific container
  let canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  canvas.parent('background-canvas-container');
  pixelDensity(1); // For better performance
  
  // Create off-screen buffer for static pattern
  mainCanvas = createGraphics(width, height);
  
  // Draw the static pattern
  drawStaticPattern();
  
  // Set a lower frameRate to reduce CPU usage
  frameRate(15);

  // The container height follows the page content (images, text reflow)
  new ResizeObserver(windowResized).observe(canvasContainer);
}

function draw() {
  // Clear the canvas
  background('#f8f9fa'); // Very light background
  
  // Update the breath cycle
  breathCycle += breathSpeed;
  
  // Calculate current opacity based on sin wave
  // The opacity will oscillate between 15% and 25%
  let opacity = map(sin(breathCycle), -1, 1, 0.15, 0.45);
  
  // Apply the breathing effect by drawing the pattern with varying opacity
  tint(255, opacity * 255);
  image(mainCanvas, 0, 0);
  noTint();
}

function drawStaticPattern() {
  // Clear the buffer
  mainCanvas.background('#f8f9fa'); // Very light background
  
  // Draw the Asanoha pattern
  drawAsanohaPattern();
}

function drawAsanohaPattern() {
  let size = 50; // Adjust for pattern density
  let cols = Math.ceil(width / size);
  let rows = Math.ceil(height / (size * 0.87)); // Hex grid adjustment

  // Set the color to your blue (low opacity is applied later in draw())
  mainCanvas.stroke('#328CC1');
  mainCanvas.strokeWeight(0.8); // Thinner lines for elegance

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * size * 1.5;
      let y = row * size * 0.87 * 2;
      
      if (col % 2 == 1) y += size * 0.87; // Offset odd columns
      
      drawAsanohaHexagon(x, y, size);
    }
  }
}

function drawAsanohaHexagon(x, y, s) {
  let angles = [PI / 3, (2 * PI) / 3, PI, (4 * PI) / 3, (5 * PI) / 3, 0];
  let points = angles.map(a => createVector(x + cos(a) * s, y + sin(a) * s));

  for (let i = 0; i < points.length; i++) {
    let p1 = points[i];
    let p2 = points[(i + 1) % points.length];
    mainCanvas.line(p1.x, p1.y, p2.x, p2.y);
  }

  // Internal Asanoha lines
  for (let i = 0; i < points.length; i += 2) {
    let mid1 = p5.Vector.lerp(points[i], points[(i + 1) % points.length], 0.5);
    let mid2 = p5.Vector.lerp(points[i], points[(i + 5) % points.length], 0.5);
    mainCanvas.line(mid1.x, mid1.y, mid2.x, mid2.y);
  }
}

// Handle window resizing
function windowResized() {
  if (canvasContainer) {
    resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    
    // Recreate the buffer and redraw the static pattern
    mainCanvas = createGraphics(width, height);
    drawStaticPattern();
  }
}