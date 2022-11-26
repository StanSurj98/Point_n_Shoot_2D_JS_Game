/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ravens to spawn at constant time for good && bad computers
let timeToNextRaven = 0; // accumulates time between frames
let ravenInterval = 500; // when accumulated "time" match interval - spawn raven & reset
let lastTime = 0; // hold value of 'timestamp' from initial loop, constantly changes


// Hold all raven instances
let ravens = [];

class Raven {
  constructor(){
    this.width = 100;
    this.height = 50;
    // just to right of canvas so they fly in
    this.x = canvas.width; 
    // ensure spawns within canvas and not above/below it | btw, () are necessary
    this.y = Math.random() * (canvas.height - this.height); 
    this.directionY = Math.random() * 5 + 3;
    this.directionX = Math.random() * 5 - 2.5;
  }
  update() {
    this.x -= this.directionX;
  }
  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}


// "Timestamp" is default JS behavior with reqAnimFrame() func
const animate = (timestamp) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Essentially "how fast your computer can serve the next frame"
  let deltaTime = timestamp - lastTime; // on my comp: 16.65ms between frames - fast
  lastTime = timestamp;
  
  // Accumulate the "time in between" new frames
  timeToNextRaven += deltaTime;
  
  // MEANING: whether computer is fast or slow - hard cap to spawn a raven at Interval
    // slow computers have big deltaTime (longer time between new frames)
    // REGARDLESS - game waits "ravenInterval" ms
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }


  requestAnimationFrame(animate);
}
// animate();