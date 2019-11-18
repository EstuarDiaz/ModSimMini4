/**
 * Variables CRISP
 *  distancia (0 - fieldWidth)
 *  dirección (ángulo)
 * 
 * Variables linguisticas
 *  Distancia: lejos, cerca
 *  Dirección: derecha, izquierda, centro 
 * 
 * Claúsulas de Horn 
 *  Si esta lejos y a la izquierda   --> moverme bastante y a la derecha
 *  Si esta cerca y a la izquierda   --> moverme poco y a la derecha
 *  Si esta lejos y a la derecha     --> moverme bastante y a la izquierda
 *  Si esta cerca y a la derecha     --> moverme poco y a la izquierda
 *  Si esta lejos y al centro        --> moverme bastante al centro 
 *  Si esta cerca y al centro        --> moverme poco al centro 
 * 
 */


// Variables globales
let fieldWidth = 640;
let fieldHeight = 480;
let ScorePos = [0, 0];
let ScoreWidth = 120;
let ScoreHeight = 50;
let PlayerPos = [0, 0];
let BallPos = [0, 0];
let BallSize = 20;
let marginWidth = 20;
let speed = 0.01;
let PlayerAngle = 0;
let graphLeft = fieldWidth + 20;
let graphTop = 50;
let graphWidth = 100;
let graphHeigth = 80;

// La fuzzy function f es representada por un numero finito de puntos
// del dominio y sus respectivas imagenes
class fuzzyFunction {
    // x = [x1,...,xn]
    // y = [f(x1),...,f(xn)]
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = x.length;
        this.lastEval = -1;
    }

    // Evalua la funcion en c y devuelve g(x) = f(c)
    eval(c) {
        let i = 0;
        let h = JSON.parse(JSON.stringify(this));
        let g = new fuzzyFunction(h.x, h.y);
        while (i < this.length) {
            if (this.x[i] >= c) {
                this.lastEval = i;
                g.y.fill(this.y[i]);
                return g;
            }
            i++;
        }
        this.lastEval = i - 1;
        g.y.fill(this.y[this.length - 1]);
        return g;
    }

    // Devuelve el valor que representa el centroide de la grafica
    defuzzify() {
        let area = 0;
        for (let i = 0; i < this.length - 1; i++) {
            // el area de cada trapezoide es el ancho por la altura promedio
            let w = this.x[i + 1] - this.x[i];
            let h = (this.y[i] + this.y[i + 1]) / 2;
            area += w * h;
        }
        let areaX = 0;
        for (let i = 0; i < this.length - 1; i++) {
            let w = this.x[i + 1] - this.x[i];
            let h = (this.y[i] + this.y[i + 1]) / 2;
            // Ahora multiplicamos cada area por x
            let x = (this.x[i] + this.x[i + 1]) / 2;
            areaX += w * h * x;
        }
        if (area == 0) {
            return 0;
        }
        let centroide = areaX / area;
        for (let i = 0; i < this.length; i++) {
            if (this.x[i] >= centroide) {
                this.lastEval = i;
                i = this.length;
            }
        }
        return centroide;
    }

    // Graficar las funciones
    graph(x1, y1, x2, y2, n = -1) {
        beginShape();
        vertex(x1, y1);
        fill(102, 178, 255);
        for (let i = 0; i < this.length; i++) {
            vertex(x1 + (x2 - x1) * (this.x[i] - this.x[0]) / (this.x[this.length - 1] - this.x[0]), y1 + this.y[i] * (y2 - y1));
        }
        vertex(x2, y1);
        endShape(CLOSE);
        if (this.lastEval >= 0) {
            stroke(255, 0, 0);
            line(x1 + (x2 - x1) * (this.x[this.lastEval] - this.x[0]) / (this.x[this.length - 1] - this.x[0]), y1 + this.y[this.lastEval] * (y2 - y1), x1 + (x2 - x1) * (this.x[this.lastEval] - this.x[0]) / (this.x[this.length - 1] - this.x[0]), y1);
            if (n > 0) {
                line(x1 + (x2 - x1) * (this.x[this.lastEval] - this.x[0]) / (this.x[this.length - 1] - this.x[0]), y1 + this.y[this.lastEval] * (y2 - y1), x2 + n * graphWidth, y1 + this.y[this.lastEval] * (y2 - y1));
            }
            stroke(0);
        }
    }
}


let domainDistance = [0., 64., 128., 192., 256., 320., 384., 448., 512., 576., 640.];
let domainDireccion = [-3.14159265, -2.51327412, -1.88495559, -1.25663706, -0.62831853,
    0., 0.62831853, 1.25663706, 1.88495559, 2.51327412, 3.14159265
];
let domain = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

let lejos = new fuzzyFunction(domainDistance, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.25, 0.5, 0.75, 1.0]);
let cerca = new fuzzyFunction(domainDistance, [1.0, 0.75, 0.5, 0.25, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);

let izquierda = new fuzzyFunction(domainDireccion, [1.0, 0.75, 0.50, 0.25, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
let derecha = new fuzzyFunction(domainDireccion, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.25, 0.50, 0.75, 1.0]);
let centro = new fuzzyFunction(domainDireccion, [0.0, 0.1, 0.25, 0.50, 0.75, 1.0, 0.75, 0.5, 0.25, 0.1, 0.0]);

let movermeBastante = new fuzzyFunction(domainDistance, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.5, 0.75, 1.0]);
let movermePoco = new fuzzyFunction(domainDistance, [1.0, 0.75, 0.5, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
let girarDerecha = new fuzzyFunction(domainDireccion, [0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.25, 0.5, 0.75, 1.0]);
let girarIzquierda = new fuzzyFunction(domainDireccion, [1.0, 0.75, 0.5, 0.25, 0.2, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0]);
let nogirar = new fuzzyFunction(domainDireccion, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);

function move() {
    PlayerAngle = atan2(BallPos[1] - PlayerPos[1], BallPos[0] - PlayerPos[0]) - HALF_PI;
    PlayerPos[0] += speed * (BallPos[0] - PlayerPos[0]);
    PlayerPos[1] += speed * (BallPos[1] - PlayerPos[1]);
    BallPos[0] += speed * (ScorePos[0] - BallPos[0]);
    BallPos[1] += speed * (ScorePos[1] - BallPos[1]);
}

function getAngle() {
    return atan2(BallPos[1] - PlayerPos[1], BallPos[0] - PlayerPos[0]);
}

function getDistance() {
    return Math.sqrt(Math.pow(2, (PlayerPos[0] - BallPos[0])) + Math.pow(2, (PlayerPos[1] - BallPos[1])))
}

function resultmove(distance, angle) {
    PlayerAngle = atan2(BallPos[1] - PlayerPos[1], BallPos[0] - PlayerPos[0]) - angle;
    PlayerPos[0] = PlayerPos[0] - distance * Math.cos(PlayerAngle);
    PlayerPos[1] = PlayerPos[1] - distance * Math.sin(PlayerAngle);
}

function fuzzyOr(f, g) {
    return fuzzyOperation(f, g, Math.max);
}

function fuzzyAnd(f, g) {
    return fuzzyOperation(f, g, Math.min);
}

function fuzzyOperation(obj1, obj2, operation) {
    if (obj1.constructor.name == "fuzzyFunction") {
        let f = JSON.parse(JSON.stringify(obj1));
        let g = JSON.parse(JSON.stringify(obj2));
        let h = new fuzzyFunction(g.x, g.y);
        for (let i = 0; i < h.length; i++) {
            let val = operation(f.y[i], g.y[i]);
            h.y[i] = val;
        }
        return h;
    } else {
        return operation(obj1, obj2);
    }
}

function fuzzyNot(obj) {
    if (obj.constructor.name == "fuzzyFunction") {
        let f = JSON.parse(JSON.stringify(obj));
        let g = new fuzzyFunction(f.x, f.y);
        for (let i = 0; i < f.length; i++) {
            g.y[i] = 1 - f.y[i];
        }
        return g;
    } else {
        return 1 - obj;
    }
}

// Recive un valor entre 0 y 1 como antecedente y 
// una fuzzyFunction como consecuente
// Devuelve otra fuzzyFunction resultante
function fuzzyImplication(antecedent, consequent) {
    return fuzzyAnd(antecedent, consequent);
}

// Devuelve una fuzzyFunction resultante de la
// combinacion de varias fuzzyFunctions
function fuzzyAgregation(F) {
    let g = fuzzyOr(F[0], F[1]);
    for (let i = 2; i < F.length; i++) {
        g = fuzzyOr(g, F[i]);
    }
    return g;
}

function setup() {
    frameRate(1);
    createCanvas(4 * fieldWidth, 4 * fieldHeight);
    ScorePos[0] = (fieldWidth - ScoreWidth) / 2;
    ScorePos[1] = 0;
    PlayerPos[0] = 0.1 * (fieldWidth - 2 * marginWidth) + marginWidth;
    PlayerPos[1] = 0.1 * (fieldHeight - 2 * marginWidth) + marginWidth;
    BallPos[0] = 0.9 * (fieldWidth - 2 * marginWidth) + marginWidth;
    BallPos[1] = 0.7 * (fieldHeight - 2 * marginWidth) + marginWidth;
    /*
    PlayerPos[0] = Math.random() * (fieldWidth - 2 * marginWidth) + marginWidth;
    PlayerPos[1] = Math.random() * (fieldHeight - 2 * marginWidth) + marginWidth;
    BallPos[0] = Math.random() * (fieldWidth - 2 * marginWidth) + marginWidth;
    BallPos[1] = Math.random() * (fieldHeight - 2 * marginWidth) + marginWidth;
    */
    //PlayerAngle = Math.random() * 7;
    PlayerAngle = 0;

}

function draw() {
    background(225);
    // Dibujar el campo
    fill(8, 161, 18);
    rect(0, 0, fieldWidth, fieldHeight);
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
    fill(255, 0, 0);
    triangle(-10, -20, 10, -20, 0, 20);
    pop();

    playerDistance = getDistance();
    playerDireccion = getAngle();

    // calculo de lasa clausulas de Horn
    //Si esta lejos y a la izquierda   --> moverme bastante y a la derecha
    let horn1A = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), izquierda.eval(playerDireccion)), movermeBastante);
    let horn1B = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), izquierda.eval(playerDireccion)), girarDerecha);
    // Si esta cerca y a la izquierda   --> moverme poco y a la derecha
    let horn2A = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), izquierda.eval(playerDireccion)), movermePoco);
    let horn2B = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), izquierda.eval(playerDireccion)), girarDerecha);
    // Si esta lejos y a la derecha     --> moverme bastante y a la izquierda
    let horn3A = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), derecha.eval(playerDireccion)), movermeBastante);
    let horn3B = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), derecha.eval(playerDireccion)), girarIzquierda);
    // Si esta cerca y a la derecha     --> moverme poco y a la izquierda
    let horn4A = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), derecha.eval(playerDireccion)), movermePoco);
    let horn4B = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), derecha.eval(playerDireccion)), girarIzquierda);
    // Si esta lejos y al centro        --> moverme bastante al centro  
    let horn5A = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), centro.eval(playerDireccion)), movermeBastante);
    let horn5B = fuzzyImplication(fuzzyAnd(lejos.eval(playerDistance), centro.eval(playerDireccion)), nogirar);
    // Si esta cerca y al centro        --> moverme poco al centro 
    let horn6A = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), centro.eval(playerDireccion)), movermePoco);
    let horn6B = fuzzyImplication(fuzzyAnd(cerca.eval(playerDistance), centro.eval(playerDireccion)), nogirar);

    //Agregación distance
    let FDis = fuzzyAgregation([horn1A, horn2A, horn3A, horn4A, horn5A, horn6A]);
    let centroideDis = FDis.defuzzify() * 0.5;

    //Agregación direccion
    let FDir = fuzzyAgregation([horn1B, horn2B, horn3B, horn4B, horn5B, horn6B]);
    let centroideDir = FDir.defuzzify();

    resultmove(0, centroideDir);
    console.log(centroideDir);
    // Dibujar las graficas
    let k = 0; // eje Y
    let l = 0; // eje X
    l = 2;
    // Horn1B
    lejos.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    izquierda.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    girarDerecha.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn1B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Horn2B
    k = 1;
    l = 2;
    cerca.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    izquierda.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    girarDerecha.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn2B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Horn3B
    k = 2;
    l = 2;
    lejos.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    derecha.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    girarIzquierda.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn3B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Horn4B
    k = 3;
    l = 2;
    cerca.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    derecha.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    girarIzquierda.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn4B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Horn5B
    k = 4;
    l = 2;
    lejos.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    centro.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    nogirar.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn5B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Horn6B
    k = 5;
    l = 2;
    cerca.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3);
    l++;
    centro.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 2);
    l++;
    nogirar.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    l++;
    horn6B.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 1);
    // Resultado
    k++;
    FDir.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
    /*
        // Obtener las graficas de las implicaciones y de agregacion
        let F1 = fuzzyImplication(fuzzyOr(f1.eval(frameCount % 10), f2.eval(frameCount * 2 % 10)), g1);
        let F2 = fuzzyImplication(f3.eval(frameCount % 10), g2);
        let F3 = fuzzyImplication(fuzzyOr(f4.eval(frameCount % 10), f5.eval(frameCount * 3 % 10)), g3);
        let F = fuzzyAgregation([F1, F2, F3]);
        let centroide = F.defuzzify();
      

        // Dibujar las graficas
        let k = 0;
        let l = 0;
        l = 2;

        // Graficas umbral
        g1.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        k = 1;
        g2.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        k = 2;
        g3.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        // Graficas de datos de entrada
        k = 0;
        l = 0;
        f1.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        l = 1;
        f2.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        k = 1;
        l = 0;
        f3.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        k = 2;
        l = 0;
        f4.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        l = 1;
        f5.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth, 3 - l);
        // implicaciones
        k = 0;
        l = 3;
        F1.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        k = 1;
        F2.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        k = 2;
        F3.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        // Agregation
        k = 3;
        l = 3;
        F.graph(graphLeft + l * graphWidth, graphTop + (k + 0.8) * graphHeigth, graphLeft + (l + 0.8) * graphWidth, graphTop + k * graphHeigth);
        // Mover
        //move();
      */
}