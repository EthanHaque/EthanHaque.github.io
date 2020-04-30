var particles_a = [];
var nums = 1000;
var noiseScale = 800;
var canvas;

function setup(){
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  background(255, 255, 255);
  for(var i = 0; i < nums; i++){
    particles_a[i] = new Particle(random(0, width),random(0,height));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw(){
  fill(255, 255, 255, 2);
  rect(0, 0, width, height);
  noStroke();
  smooth();
    for(var i = 0; i < nums; i++){
    var radius = map(i,0,nums,1,2);
    var alpha = map(i,0,nums,0,120);

    fill(89, 82, 70, alpha);
    particles_a[i].move();
    particles_a[i].display(radius);
    particles_a[i].checkEdge();
  }  
}


function Particle(x, y){
  this.lifespan = 400;
  this.dir = createVector(0, 0);
  this.vel = createVector(0, 0);
  this.pos = createVector(x, y);
  this.speed = 0.5;

  this.move = function(){
    if(this.lifespan > 0) {
    var angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale;
    this.dir.x = cos(angle);
    this.dir.y = sin(angle);
    this.vel = this.dir.copy();
    this.vel.mult(this.speed);
    this.pos.add(this.vel);
    this.lifespan--;
    }
    else {
      this.lifespan = 400;
      this.pos.x = random(0, width);
      this.pos.y = random(0, height);
    }
  };

  this.checkEdge = function(){
    if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0){
      this.pos.x = random(0, width);
      this.pos.y = random(0, height);
    }
  };

  this.display = function(r){
    ellipse(this.pos.x, this.pos.y, r, r);
  };
}
