/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---- Collision Canvas ----
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

// ---- Scores
let score = 0;
ctx.font = "50px Impact"; // Global canvas font
let lives = 5;
let gameOver = false;
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

    // On Spawn Ravens get random colors according to [R, G, B] with values == 0-255
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    // Here the tutorial says to concatenate CSS rgb() string
    this.color = `rgb( ${this.randomColors[0]} , ${this.randomColors[1]} , ${this.randomColors[2]})`;
  }

  update(deltaTime) {
    // If they hit the top or bottom of our canvas, flip their directionY movement
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY; // Allows some ravens to fly up or down

    // When ENTIRE raven width is past the left side, mark delete & count down lives
    if (this.x < 0 - this.width) {
      this.markedForDeletion = true;
      lives--;
      if (lives === 0) gameOver = true;
    }

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
    // Avoid tainted canvas error, draw the "hitboxes" on collision canvas
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
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

// ---- Explosions
let explosions = [];
class Explosions {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "./images/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    // Dimension and Position will derive from Raven being clicked
    this.size = size * 0.65; // Scales based on raven, but even smaller
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    // this.sound.src = './sounds/boom.wav';
    this.timeSinceLastFrame = 0;
    this.frameInterval = 75;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) {
      this.sound.play(); // plays sound on 1st frame
    }
    this.timeSinceLastFrame += deltaTime; // similar to raven flap
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++; // animates explosions
      this.timeSinceLastFrame = 0; // !NOTE! must reset this, else only 1st frame affect
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.size,
      this.size
    );
  }
}

// ---- Game Details
function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  // writing twice here just gives off a shadow effect
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 54, 78);
}
function drawLives() {
  ctx.fillStyle = "black";
  ctx.fillText("Lives: " + lives, 500, 75);
  // writing twice here just gives off a shadow effect
  ctx.fillStyle = "white";
  ctx.fillText("Lives: " + lives, 504, 78);
}
function drawGameOver() {
  ctx.textAlign = "center"; // Else it goes to "top-left" of the text
  ctx.fillStyle = "black";
  ctx.fillText(
    `GAME OVER\n Your Score: ${score}`,
    canvas.width * 0.5,
    canvas.height * 0.5
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    `GAME OVER\n Your Score: ${score}`,
    canvas.width * 0.5 + 4,
    canvas.height * 0.5 + 3
  );
}

// ---- "Click to Shoot" Event
window.addEventListener("click", function (e) {
  // 4 args: where to scan canvas && how big, in this case: at our click && 1x1px
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  // Study built-in func "getImageData()" more, it has intricacies
  const pc = detectPixelColor.data;
  console.log(pc);
  ravens.forEach((raven) => {
    if (
      raven.randomColors[0] === pc[0] &&
      raven.randomColors[1] === pc[1] &&
      raven.randomColors[2] === pc[2]
    ) {
      // ---- Collision Detected
      raven.markedForDeletion = true;
      score++;
      // Add explosions to array, size & position should depend on raven clicked
      explosions.push(new Explosions(raven.x, raven.y, raven.width));
      // console.log("Explosions being added: ", explosions);
    }
  });
});

// ---- Main Animation Loop ----
function animate(timestamp) {
  // 'timestamp' is built in with 'requestAnimationFrame()' function

  // ---- Clear Hitboxes && Ravens
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

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

    // ---- "Layering" Ravens by Size
    ravens.sort((a, b) => {
      // Sort the array in ascending order based on widths
      // small appear at back & large at front | drawn based on order in array
      return a.width - b.width;
    });
  }

  // ---- Scoreboard
  // !NOTE! on same canvas, render order matters
  drawScore();
  drawLives();

  // ---- Draw, Update & Delete Ravens
  // Now we see benefit of spread operator here to call both explosions and ravens
  [...ravens, ...explosions].forEach((object) => object.update(deltaTime));
  [...ravens, ...explosions].forEach((object) => object.draw());

  // Deleting ravens that moved past canvas to not bloat ravens array
  // Re-assign ravens array to new array where ONLY markedForDeletion = false
  ravens = ravens.filter((raven) => !raven.markedForDeletion);
  explosions = explosions.filter((explosion) => !explosion.markedForDeletion);

  // Recursion call until gameOver is truthy
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

// Passing initial timestamp = 0, to avoid undefined
animate(0);
