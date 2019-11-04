
// Global variables
let fieldWidth = 640;
let fieldHeight = 480;
let ScorePos = [0,0];
let ScoreWidth = 120;
let ScoreHeight = 50;
let PlayerPos = [0,0];
let BallPos = [0,0];
let BallSize = 20;
let marginWidth = 20;
let speed = 0.01;
let PlayerAngle = 0;

function setup() {
  createCanvas(fieldWidth, fieldHeight);
  ScorePos[0] = (fieldWidth-ScoreWidth)/2;
  ScorePos[1] = 0;
  PlayerPos[0] = Math.random()*(fieldWidth-2*marginWidth)+marginWidth;
  PlayerPos[1] = Math.random()*(fieldHeight-2*marginWidth)+marginWidth;
  BallPos[0] = Math.random()*(fieldWidth-2*marginWidth)+marginWidth;
  BallPos[1] = Math.random()*(fieldHeight-2*marginWidth)+marginWidth;
  PlayerAngle = Math.random()*6;
  fill(255);
  let f = new fuzzyFunction([0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5,6,6,6,6]);
  let g = new fuzzyFunction([0,1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1,0]);
  let h = fuzzyOr(f,g);
  console.log(f);
  console.log(h);
  console.log(defuzzify(f));
  console.log(defuzzify(h));
}

function draw() {
  // Dibujar la pelota y la porteria
  background(0,153,0);
  fill(255);
  rect(ScorePos[0], ScorePos[1], ScoreWidth, ScoreHeight);
  fill(255);
  ellipse(BallPos[0], BallPos[1], BallSize, BallSize);
  // Dibujar el triangulito
  push();
  translate(PlayerPos[0], PlayerPos[1]);
  rotate(PlayerAngle);
  fill(255,0,0);
  triangle(-10,-20,10,-20,0,20);
  pop();
  // Mover
  //move();
}

function move(){
  PlayerAngle = atan2(BallPos[1]-PlayerPos[1], BallPos[0]-PlayerPos[0]) - HALF_PI;
  PlayerPos[0] += speed*(BallPos[0]-PlayerPos[0]);
  PlayerPos[1] += speed*(BallPos[1]-PlayerPos[1]);
  BallPos[0] += speed*(ScorePos[0]-BallPos[0]);
  BallPos[1] += speed*(ScorePos[1]-BallPos[1]);
}

function getAngle(){
  return atan2(BallPos[1]-PlayerPos[1], BallPos[0]-PlayerPos[0]);
}

class fuzzyFunction{
  // The fuzzy function f is represented by a finite set of points
  // and the values of f at those points.
  // x = [x1,...,xn]
  // y = [f(x1),...,f(xn)]
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.length = x.length;
  }

  // Evalueates the function in x, i.e. returns f(x)
  eval(x){
    let i = 0;
    while(i < this.length){
      if(this.x[i] >= x){
        return this.y[i];
      }
      i++;
    }
    return this.y[this.length-1];
  }

  graph(x,y,scaleX,scaleY){
    line(x,y,x+100,y);
    for(let i =0; i < this.length-1; i++){
      line(x + this.x[i]*scaleX, y + this.y[i]*scaleY, x + this.x[i+1]*scaleX, y + this.y[i+1]*scaleY);
    }
  }
}

function fuzzyOr(f,g){
  return fuzzyOperation(f, g, Math.max);
}

function fuzzyAnd(f,g){
  return fuzzyOperation(f, g, Math.min);
}

function fuzzyOperation(obj1,obj2,operation){
  if(obj1.constructor.name == "fuzzyFunction"){
    var f = JSON.parse(JSON.stringify(obj1));
    var g = JSON.parse(JSON.stringify(obj2));
    let h = new fuzzyFunction(f.x,f.y);
    for(let i = 0; i < h.length; i++){
      let val = operation(f.y[i],g.y[i]);
      h.y[i] = val;
    }
    return h;
  }
  else{
    return operation(obj1,obj2);
  }
}

function fuzzyNot(obj){
  if(obj.constructor.name == "fuzzyFunction"){
    let f = JSON.parse(JSON.stringify(obj));
    let g = new fuzzyFunction(f.x,f.y);
    for(let i = 0; i < f.length; i++){
      g.y[i] = 1 - f.y[i];
    }
    return g;
  }
  else{
    return 1 - obj;
  }
}

// Recive un valor entre 0 y 1 como antecedente y 
// una fuzzyFunction como consecuente
// Devuelve otra fuzzyFunction resultante
function fuzzyImplication(antecedent,consequent){
  let f = JSON.parse(JSON.stringify(consequent));
  for(let  i = 0; i < f.length; i++){
    f.y[i] = antecedent;
  }
  return fuzzyOr(f,consequent);
}

// Devuelve una fuzzyFunction resultante de la
// combinacion de varias fuzzyFunctions
function fuzzyAgregation(F){
  let g = fuzzyAnd(F[0],F[1]);
  for(let i = 2; i < F.length; i ++){
    g = fuzzyAnd(g,F[i]);
  }
  return g;
}

// Devuelve el valor que representa el centroide de la grafica
// de la fuzzyFunction
function defuzzify(f){
  let area = 0;
  for(let i = 0; i < f.length-1; i++){
    // the area of each trapezoid is base times height
    // the height is calculated as the average of the two points that define the trapezoid
    let w = f.x[i+1] - f.x[i];
    let h = (f.y[i] + f.y[i+1])/2;
    area += w*h;
  }
  let areaX = 0;
  for(let i = 0; i < f.length-1; i++){
    let w = f.x[i+1] - f.x[i];
    let h = (f.y[i] + f.y[i+1])/2;
    // Now we multiply the area by x
    let x = (f.x[i] + f.x[i+1])/2;
    areaX += w*h*x;
  }
  return areaX / area;
}