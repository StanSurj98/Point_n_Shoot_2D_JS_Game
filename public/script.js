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
  constructor() {
    this.width = 100;
    this.height = 50;
    // just to right of canvas so they fly in
    this.x = canvas.width;
    // ensure spawns within canvas and not above/below it | btw, () are necessary
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
  }
  update() {
    this.x -= this.directionX;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
  }
  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// "Timestamp" is default JS behavior with reqAnimFrame() func
const animate = (timestamp) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ---- Spawning Ravens 
  // Essentially "how fast your computer can serve the next frame"
  let deltaTime = timestamp - lastTime; // on my comp: 16.65ms between frames - fast
  lastTime = timestamp;

  // Accumulate the "time in between" new frames
  timeToNextRaven += deltaTime;

  // MEANING: whether computer fast or slow - hard cap spawning ravens at Interval
  // slow computers = big deltaTime (longer time between new frames)
  // REGARDLESS - game waits "ravenInterval" ms
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }

  // ---- Draw, Update & Delete Ravens
  // Using spread here for the future if need to call update() or draw() on multiple sources (ie. powerups, other enemies, etc) can group them all together in 1 spread
  [...ravens].forEach(raven => raven.update());
  [...ravens].forEach(raven => raven.draw());

  // Next, deleting ravens that moved past canvas to not bloat ravens array
  // Re-assign ravens array to new array where ONLY markedForDeletion = false
  ravens = ravens.filter(raven => !raven.markedForDeletion);
  // console.log(ravens); 

  requestAnimationFrame(animate);
};
// animate(0); // Passing initial timestamp = 0, to avoid undefined
