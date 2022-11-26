/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Will hold all objects of ravens later
let ravens = [];

class Raven {
  constructor(){
    this.width = 100;
    this.height = 50;
    // just to the right of view so they fly in
    this.x = canvas.width; 
    // so that each raven spawns within canvas and not above/below it | btw the () are necessary
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


const raven = new Raven();

const animate = (timestamp) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  raven.update();
  raven.draw();

  // Recursion animation calls
  requestAnimationFrame(animate);
}
animate();