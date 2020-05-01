/******************
Code by Vamoss
Original code link:
https://www.openprocessing.org/sketch/624879

Author links:
http://vamoss.com.br
http://twitter.com/vamoss
http://github.com/vamoss

editied by Ethan Haque
******************/

var circles = [];
var total = 500;
var img;
var canvas;
var leftPadding;
var topPadding;

function preload() {
    img = loadImage('castro2.jpg');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    //canvas = createCanvas(img.width, img.height);
    canvas = createCanvas(windowWidth, windowHeight);
    leftPadding = (width - img.width) / 2;
    topPadding = (height - img.height) / 2;
    var x = 0;
    var y = 0;
    canvas.position(x, y);
    canvas.style("z-index", "-10");
    background(0);

    for (var i = 0; i < total; i++) {
        circles[i] = {};
        circles[i].prevPos = { x: img.width / 2, y: img.height / 2 };
        circles[i].pos = { x: img.width / 2, y: img.height / 2 };
        circles[i].dir = random() > 0.5 ? 1 : -1;
        circles[i].radius = random(3, 10);
        circles[i].angle = 0;
    }
}

function draw() {
    for (var i = 0; i < total; i++) {
        var circle = circles[i];
        circle.angle += 1 / circle.radius * circle.dir;

        circle.pos.x += cos(circle.angle) * circle.radius;
        circle.pos.y += sin(circle.angle) * circle.radius;
        if (brightness(img.get(round(circle.pos.x), round(circle.pos.y))) > 80 || circle.pos.x < 0 || circle.pos.x > width || circle.pos.y < 0 || circle.pos.y > height) {
            circle.dir *= -1;
            circle.radius = random(3, 10);
            circle.angle += PI;
        }
        stroke(img.get(circle.pos.x, circle.pos.y));
        line(circle.prevPos.x + leftPadding, circle.prevPos.y + topPadding, circle.pos.x + leftPadding, circle.pos.y + topPadding);

        circle.prevPos.x = circle.pos.x;
        circle.prevPos.y = circle.pos.y;
        if (millis() > 120000) {
            exit();
        }
    }


}