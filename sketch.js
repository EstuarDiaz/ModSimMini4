
// Global variables
let width = 640;
let height = 480;
let ScorePos = [0,0];
let PlayerPos = [0,0];
let BallPos = [0,0];
let speed = 0.01;
let angle = 0;

function setup() {
  createCanvas(width, height);
  ScorePos[0] = Math.random()*width;
  ScorePos[1] = Math.random()*height;
  PlayerPos[0] = Math.random()*width;
  PlayerPos[1] = Math.random()*height;
  BallPos[0] = Math.random()*width;
  BallPos[1] = Math.random()*height;
  fill(255);
}

function draw() {
  // Dibujar la pelota y la porteria
  background(0,153,0);
  fill(255);
  rect(ScorePos[0], ScorePos[1], 120, 50);
  fill(255);
  ellipse(BallPos[0], BallPos[1], 20, 20);
  // Dibujar el triangulito
  push();
  translate(PlayerPos[0], PlayerPos[1]);
  rotate(angle);
  fill(255,0,0);
  triangle(-15,-20,15,-20,0,20);
  pop();
  // Mover
  move();
}

function move(){
  angle = atan2(BallPos[1]-PlayerPos[1], BallPos[0]-PlayerPos[0]) - HALF_PI;
  PlayerPos[0] += speed*(BallPos[0]-PlayerPos[0]);
  PlayerPos[1] += speed*(BallPos[1]-PlayerPos[1]);
  BallPos[0] += speed*(ScorePos[0]-BallPos[0]);
  BallPos[1] += speed*(ScorePos[1]-BallPos[1]);
}