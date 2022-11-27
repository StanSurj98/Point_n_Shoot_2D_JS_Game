/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// ---- Scores
let score = 0;
ctx.font = '50px Impact'; // Global canvas font
// ---- Equalize Raven Spawn Times /b/ Good & Bad PCs
let timeToNextRaven = 0; // accumulates time between frames
let ravenInterval = 500; // when timeToNextRaven matches interval - spawn raven & reset
let lastTime = 0; // hold value of 'timestamp' from initial loop, constantly changes

// Hold all raven instances
let ravens = [];

class Raven {
  constructor() {
    // Raven Sprite
    this.image = new Image();
    this.image.src = "./images/raven.png";

    // sprite.dimensions = each ACTUAL FRAME size from sprite sheet
    this.spriteWidth = 271; // 1626px / 6
    this.spriteHeight = 194;
    // Scale ravens - randomize size a bit
    this.sizeModifier = Math.random() * 0.6 + 0.4;

    // Height/Width below is EACH INSTANCE of a raven when appearing on screen
    // Multiplication is more performant than division
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;

    // Spawn Ravens to right of canvas so they fly in
    this.x = canvas.width;
    // Spawn within canvas, not above/below it | () are necessary here
    this.y = Math.random() * (canvas.height - this.height);
    // Raven movement speeds
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    // Keeps track for when the move past left of screen later
    this.markedForDeletion = false;

    // Animate raven frames on sprite sheet
    this.frame = 0;
    this.maxFrame = 4;
    // Equalize Animation for good and bad PCs
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50; // Random num between 50-100, each bird
  }

  update(deltaTime) {
    // If they hit the top or bottom of our canvas, flip their directionY movement
    if(this.y < 0 || this.y > canvas.height - this.height ) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY; // Allows some ravens to fly up or down


    // When ENTIRE raven width is past the left side, mark delete
    if (this.x < 0 - this.width) this.markedForDeletion = true;


    // ---- Animate Through Frames 
    // !NOTE! "deltaTime" is time for computer to serve a new frame
    this.timeSinceFlap += deltaTime; // Equalizes good and bad PCs

    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) {
        this.frame = 0;
      } else {
        this.frame++;
      }
      this.timeSinceFlap = 0; // must reset it to 0
    }
  }

  draw() {
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth, // Crop start @ each frame && frames increase
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}


function drawScore(){
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 50, 75);
  // writing twice here just gives off a shadow effect
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 54, 78);
}

window.addEventListener("click", function(e) {
  // We want collision detection by colors 
  // Takes 4 args: where we're scanning and how big, in this case 1:1px 
  const detectPixelColor = ctx.getImageData(e.x, e.y, 1, 1); // Built in ctx func
  // Study this .getImageData more, it has intricacies
  console.log(detectPixelColor);
})


// "Timestamp" is default JS behavior with reqAnimFrame() func
function animate(timestamp){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ---- Spawning Ravens
  // !NOTE! "how fast your computer can serve the next frame"
  let deltaTime = timestamp - lastTime; // on M1 Air: 16.65ms between frames - fast
  lastTime = timestamp;
  timeToNextRaven += deltaTime;

  // MEANING: whether PC fast or slow - hard cap spawning ravens at Interval
  // slow computers = big deltaTime (longer time between new frames)
  // REGARDLESS - game waits "ravenInterval" ms
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }

  // ---- Scoreboard
  // !NOTE! We're on same canvas, so render order matters
  drawScore();



  // ---- Draw, Update & Delete Ravens
  // Using "spread" here for the future if need to call update() or draw() on multiple sources (ie. powerups, other enemies, etc) can group them all together in 1 spread
  [...ravens].forEach((raven) => raven.update(deltaTime));
  [...ravens].forEach((raven) => raven.draw());

  // Deleting ravens that moved past canvas to not bloat ravens array
  // Re-assign ravens array to new array where ONLY markedForDeletion = false
  ravens = ravens.filter((raven) => !raven.markedForDeletion);

  requestAnimationFrame(animate);
};

// Passing initial timestamp = 0, to avoid undefined
animate(0); 
