//LIBS
var mic;
//WINDOW
let width = 1024;
let height = 683;
let centerX = width / 2;
let centerY = height / 2;
//CONFIG
let years = 24;
let crossairSize = 35;
//GAME OBJECTS
let mokica;
let cakes = [];
let totalCakesSpawned = 0;
let crossair;
let images = {};
//VARIABLES
let lastSpawn = 0;
let offset;
//..

function loadImages() {
    images["cakes"] = [];
    images["mokica"] = loadImage("./assets/mokica.png")
    images["cakes"].push(loadImage("./assets/cake1.png"))
}

function preload() {
    loadImages();
}
function setup() {

    let canvas = createCanvas(width, height);
    canvas.mousePressed(fire);
    // Create an Audio input

    offset = random(150, 2000)

    mic = new p5.AudioIn();
    mokica = new Mokica()
    crossair = new Crossair(crossairSize)
    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    spawnCakes();
}

function draw() {
    spawnCakes();
    background(1, 1, 1);
    clear()
    ellipseMode(CENTER);

    mokica.display()
    crossair.display()
    //CAKES 
    for (let i = 0; i < cakes.length; i++) {
        let cake = cakes[i];
        if (cake.shouldDie()) {
            console.log('die?')
            //Delete if dead
            cakes.splice(i, 1);
        } else {
            cake.move();
            cake.display();
        }
    }

    // Get the overall volume (between 0 and 1.0)
    var vol = mic.getLevel();
    fill(127);
    stroke(0);

    // Draw an ellipse with height based on volume
    var h = map(vol, 0, 1, height, 0);
    ellipse(width / 2, h - 25, 50, 50);
}

function fire() {
    for (let i = 0; i < cakes.length; i++) {
        const cake = cakes[i];
        let coll = collideCircleCircle(mouseX, mouseY, crossair.size, cake.hitbox['x'], cake.hitbox['y'], cake.hitbox['r'])
        if (coll) {
            console.log("collision")
            cakes.splice(i, 1)
            break;
        }
    }
}

function spawnCakes() {
    let currTime = Date.now();
    if (totalCakesSpawned <= years && lastSpawn + offset < currTime) {
        offset += random(70, 120);
        lastSpawn = Date.now() + offset;
        console.log('new cake is spawned', "cakes left alive:" + cakes.length, "cakes left:" + (years - totalCakesSpawned))
        cakes.push(new Cake())
        totalCakesSpawned++;
    }
}

////////////////////////////////////////////////////////////////
// Classes
////////////////////////////////////////////////////////////////

class Crossair {
    constructor(size) {
        this.size = size;
        this.thicc = size / 10;
        this.hitbox={};
        this.hitbox['x'] = mouseX;
        this.hitbox['y'] = mouseY;
        this.hitbox['r'] = this.size;
    }
    display() {
        this.hitbox['x'] = mouseX;
        this.hitbox['y'] = mouseY;
        stroke(24)
        ellipse(mouseX, mouseY, this.size)
        rect(mouseX - this.size / 2, mouseY - this.thicc / 2, this.size, this.thicc)
        rect(mouseX - this.thicc / 2, mouseY - this.size / 2, this.thicc, this.size)
    }
}

class Mokica {
    constructor() {
        this.x = centerX;
        this.y = centerY;
        this.img = images['mokica'];
        this.hitbox = {};
        this.hitbox["x"] = this.x;
        this.hitbox["y"] = this.y;
        this.hitbox["r"] = this.img.width / 11 * 9;
    }
    display() {
        push()
        if (mouseX > centerX) {
            //rotate left
            translate(this.x + this.img.width / 2, this.y - this.img.height / 2);
            scale(-1, 1);
            image(this.img, 0, 0);
        } else {
            image(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2)
        }
        pop()
        fill(255, 255, 255, 3)
        // ellipseMode(CENTER)
        ellipse(this.hitbox['x'], this.hitbox['y'], this.hitbox['r'])
    }
}

class Cake {
    constructor() {
        /* 0 = gore; 1 = levo; 2 = dole; 3 = desno*/
        let side = round(random(0, 3));
        switch (side) {
            case 0:
                this.x = random(-10, width + 10)
                this.y = -10;
                break;
            case 1:
                this.x = -10;
                this.y = random(-10, height + 10)
                break;
            case 2:
                this.x = random(-10, width + 10)
                this.y = height + 10;
                break;
            case 3:
                this.x = width + 10;
                this.y = random(-10, height + 10);
                break;
        }
        this.side = side;
        this.startX = this.x;
        this.startY = this.y;
        this.lerpSpeed = 0.005;
        this.isAlive = false;
        this.img = images['cakes'][0];
        this.hitbox = {};
        this.hitbox["x"] = this.x - this.img.width / 4 + 20;
        this.hitbox["y"] = this.y - this.img.height / 2 + 50;
        this.hitbox["r"] = 60;
    }
    display() {
        this.hitbox["x"] = this.x - this.img.width / 4 + 20;
        this.hitbox["y"] = this.y - this.img.height / 2 + 50;
        this.hitbox["r"] = 60;
        image(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2, this.img.width / 2, this.img.height / 2)
        //Hitboxes
        fill(255, 255, 255, 3)
        // ellipseMode(CENTER)
        ellipse(this.hitbox['x'], this.hitbox['y'], this.hitbox['r'])
    }
    shouldDie() {
        let passedHalf = collideCircleCircle(this.hitbox["x"], this.hitbox["y"], this.hitbox["r"], mokica.hitbox["x"], mokica.hitbox["y"], mokica.hitbox["r"])
        if (passedHalf) {
            return true;
        }
        return false
    }
    move() {
        switch (this.side) {
            case 0:
                this.x = lerp(this.x, centerX, this.lerpSpeed)
                this.y = lerp(this.y, centerY * 2, this.lerpSpeed)
                break;
            case 1:
                this.x = lerp(this.x, centerX * 2, this.lerpSpeed)
                this.y = lerp(this.y, centerY, this.lerpSpeed)
                break;
            case 2:
                this.x = lerp(this.x, centerX, this.lerpSpeed)
                this.y = lerp(this.y, 0, this.lerpSpeed)
                break;
            case 3:
                this.x = lerp(this.x, 0, this.lerpSpeed)
                this.y = lerp(this.y, centerY, this.lerpSpeed)
                break;
        }
    }
}

class AirBubble {

}