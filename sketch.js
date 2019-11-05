
// Variables globales
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
let graphLeft = fieldWidth+20;
let graphTop = 50;
let graphWidth = 100;
let graphHeigth = 80;

// La fuzzy function f es representada por un numero finito de puntos
// del dominio y sus respectivas imagenes
class fuzzyFunction{
  // x = [x1,...,xn]
  // y = [f(x1),...,f(xn)]
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.length = x.length;
    this.lastEval = -1;
  }

  // Evalua la funcion en c y devuelve g(x) = f(c)
  eval(c){
    let i = 0;
    let h = JSON.parse(JSON.stringify(this));
    let g = new fuzzyFunction(h.x,h.y);
    while(i < this.length){
      if(this.x[i] >= c){
        this.lastEval = i;
        g.y.fill(this.y[i]);
        return g;
      }
      i++;
    }
    this.lastEval = i-1;
    g.y.fill(this.y[this.length-1]);
    return g;
  }

  // Devuelve el valor que representa el centroide de la grafica
  defuzzify(){
    let area = 0;
    for(let i = 0; i < this.length-1; i++){
      // el area de cada trapezoide es el ancho por la altura promedio
      let w = this.x[i+1] - this.x[i];
      let h = (this.y[i] + this.y[i+1])/2;
      area += w*h;
    }
    let areaX = 0;
    for(let i = 0; i < this.length-1; i++){
      let w = this.x[i+1] - this.x[i];
      let h = (this.y[i] + this.y[i+1])/2;
      // Ahora multiplicamos cada area por x
      let x = (this.x[i] + this.x[i+1])/2;
      areaX += w*h*x;
    }
    let centroide = areaX / area;
    for(let i = 0; i < this.length; i++){
      if(this.x[i] >= centroide){
        this.lastEval = i;
        i = this.length;
      }
    }
    return centroide;
  }

  // Graficar las funciones
  graph(x1,y1,x2,y2,n = -1){
    beginShape();
    vertex(x1,y1);
    fill(102,178,255);
    for(let i = 0; i < this.length; i++){
      vertex(x1 + (x2-x1)*(this.x[i]+this.x[0])/(this.x[this.length-1]-this.x[0]), y1 + this.y[i]*(y2-y1));
    }
    vertex(x2,y1);
    endShape(CLOSE);
    if(this.lastEval >= 0){
      stroke(255,0,0);
      line(x1 + (x2-x1)*(this.x[this.lastEval]+this.x[0])/(this.x[this.length-1]-this.x[0]), y1 + this.y[this.lastEval]*(y2-y1), x1 + (x2-x1)*(this.x[this.lastEval]+this.x[0])/(this.x[this.length-1]-this.x[0]), y1);
      if(n > 0){
        line(x1 + (x2-x1)*(this.x[this.lastEval]+this.x[0])/(this.x[this.length-1]-this.x[0]), y1 + this.y[this.lastEval]*(y2-y1), x2+n*graphWidth, y1 + this.y[this.lastEval]*(y2-y1));
      }
      stroke(0);
    }
  }
}

let domain = [0,1,2,3,4,5,6,7,8,9];
let f = new fuzzyFunction(domain,[0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.6,0.4,0.6]);
let g = new fuzzyFunction(domain,[0.9,0.8,0.7,0.6,1.0,0.4,0.3,0.2,0.1,0.0]);

let f1 = new fuzzyFunction(domain,[1.0,0.9,0.5,0.1,0.0,0.0,0.0,0.0,0.0,0.0]);
let f2 = new fuzzyFunction(domain,[1.0,0.7,0.4,0.1,0.0,0.0,0.0,0.0,0.0,0.0]);
let f3 = new fuzzyFunction(domain,[0.0,0.1,0.4,0.8,1.0,0.8,0.4,0.1,0.0,0.0]);
let f4 = new fuzzyFunction(domain,[0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.5,0.9,1.0]);
let f5 = new fuzzyFunction(domain,[0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.4,0.7,1.0]);

let g1 = new fuzzyFunction(domain,[0.0,0.5,1.0,0.5,0.0,0.0,0.0,0.0,0.0,0.0]);
let g2 = new fuzzyFunction(domain,[0.0,0.0,0.0,0.5,1.0,0.5,0.0,0.0,0.0,0.0]);
let g3 = new fuzzyFunction(domain,[0.0,0.0,0.0,0.0,0.0,0.0,0.5,1.0,0.5,0.0]);

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

function fuzzyOr(f,g){
  return fuzzyOperation(f, g, Math.max);
}

function fuzzyAnd(f,g){
  return fuzzyOperation(f, g, Math.min);
}

function fuzzyOperation(obj1,obj2,operation){
  if(obj1.constructor.name == "fuzzyFunction"){
    let f = JSON.parse(JSON.stringify(obj1));
    let g = JSON.parse(JSON.stringify(obj2));
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
  return fuzzyAnd(antecedent,consequent);
}

// Devuelve una fuzzyFunction resultante de la
// combinacion de varias fuzzyFunctions
function fuzzyAgregation(F){
  let g = fuzzyOr(F[0],F[1]);
  for(let i = 2; i < F.length; i ++){
    g = fuzzyOr(g,F[i]);
  }
  return g;
}

function setup() {
  frameRate(3);
  createCanvas(2*fieldWidth, fieldHeight);
  ScorePos[0] = (fieldWidth-ScoreWidth)/2;
  ScorePos[1] = 0;
  PlayerPos[0] = Math.random()*(fieldWidth-2*marginWidth)+marginWidth;
  PlayerPos[1] = Math.random()*(fieldHeight-2*marginWidth)+marginWidth;
  BallPos[0] = Math.random()*(fieldWidth-2*marginWidth)+marginWidth;
  BallPos[1] = Math.random()*(fieldHeight-2*marginWidth)+marginWidth;
  PlayerAngle = Math.random()*6;
}

function draw() {
  background(225);
  // Dibujar el campo
  fill(8,161,18);
  rect(0,0,fieldWidth, fieldHeight);
  // Dibujar la porteria
  fill(255);
  rect(ScorePos[0], ScorePos[1], ScoreWidth, ScoreHeight);
  // Dibujar la pelota
  fill(255);
  ellipse(BallPos[0], BallPos[1], BallSize, BallSize);
  // Dibujar el triangulito
  push();
  translate(PlayerPos[0], PlayerPos[1]);
  rotate(PlayerAngle);
  fill(255,0,0);
  triangle(-10,-20,10,-20,0,20);
  pop();
  // Obtener las graficas de las implicaciones y de agregacion
  let F1 = fuzzyImplication(fuzzyOr(f1.eval(frameCount % 10),f2.eval(frameCount*2 % 10)),g1);
  let F2 = fuzzyImplication(f3.eval(frameCount % 10),g2);
  let F3 = fuzzyImplication(fuzzyOr(f4.eval(frameCount % 10),f5.eval(frameCount*3 % 10)),g3);
  let F = fuzzyAgregation([F1,F2,F3]);
  let centroide = F.defuzzify();
  // Dibujar las graficas
  let k = 0;
  let l = 0;
  l = 2;
  // Graficas umbral
  g1.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  k = 1;
  g2.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  k = 2;
  g3.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  // Graficas de datos de entrada
  k = 0;
  l = 0;
  f1.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  l = 1;
  f2.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  k = 1; l = 0;
  f3.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  k = 2; l = 0;
  f4.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  l = 1;
  f5.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth,3-l);
  // implicaciones
  k = 0;
  l = 3;
  F1.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  k = 1;
  F2.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  k = 2;
  F3.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  // Agregation
  k = 3;
  l = 3;
  F.graph(graphLeft + l*graphWidth,graphTop+(k+0.8)*graphHeigth, graphLeft + (l+0.8)*graphWidth, graphTop+k*graphHeigth);
  // Mover
  //move();
}