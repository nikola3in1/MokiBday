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
let sensitivity = height
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
    angleMode(DEGREES)
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
}

function draw() {
    background(1, 1, 1);
    clear()
    spawnCakes();
    //CAKES 
    for (let i = 0; i < cakes.length; i++) {
        let cake = cakes[i];
        cake.move();
        cake.display();
    }
    mokica.display()
    mokica.blow()
    crossair.display()

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
        // console.log('new cake is spawned', "cakes left alive:" + cakes.length, "cakes left:" + (years - totalCakesSpawned))
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
        this.hitbox = {};
        this.hitbox['x'] = mouseX;
        this.hitbox['y'] = mouseY;
        this.hitbox['r'] = this.size;
    }
    display() {
        this.hitbox['x'] = mouseX;
        this.hitbox['y'] = mouseY;
        stroke(24)
        fill(0, 0, 0, 0.5)
        // ellipse(mouseX, mouseY, this.size)
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
        this.facing = "left";
    }
    display() {
        push()
        if (mouseX > centerX) {
            //rotate left
            translate(this.x + this.img.width / 2, this.y - this.img.height / 2);
            scale(-1, 1);
            image(this.img, 0, 0);
            this.facing = "right";
        } else {
            image(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2)
            this.facing = "left";
        }
        pop()
        fill(255, 255, 255, 3)
        // ellipse(this.hitbox['x'], this.hitbox['y'], this.hitbox['r'])
    }
    blow() {
        // Get the overall volume (between 0 and 1.0)
        var vol = mic.getLevel();
        var length = map(vol, 0, 1, 0, sensitivity);

        if (length < 60) {
            return;
        }

        let x = 505;
        let y = 403;
        if (this.facing == "right") {
            x += 20;
        }

        let x2 = mouseX;
        let y2 = mouseY;

        let distance = dist(x, y, x2, y2)
        let ratio = length / distance;

        x2 = lerp(x, ratio * x2 + (1 - ratio) * x, 0.9);
        y2 = lerp(y, ratio * y2 + (1 - ratio) * y, 0.9);

        stroke('rgba(0,0,0,0.50)');
        strokeWeight(3)


        let minRng = -250; let maxRng = 250;
        let supJit = map(length, 0, sensitivity, 10, 80);

        for (let i = 0; i < cakes.length; i++) {
            const cake = cakes[i];
            if (collideLineCircle(x, y, x2, y2, cake.hitbox['x'], cake.hitbox['y'], cake.hitbox['r'])) {
                cakes.splice(i, 1)
            }
        }
        curve(
            x + random(-20, 20), y + random(-20, 20),
            x - 3, y,
            x2 - 3 + random(-15, 15), y2 + random(-15, 15),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        curve(
            x + random(-20, 20), y + random(-20, 20),
            x + 3, y,
            x2 + 3 + random(-15, 15), y2 + random(-15, 15),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        curve(
            x + random(-20, 20), y + random(-20, 20),
            x, y - 3,
            x2 + random(-15, 15), y2 - 3 + random(-15, 15),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        curve(
            x + random(-20, 20), y + random(-20, 20),
            x, y + 3,
            x2 + random(-supJit, supJit), y2 + random(-supJit, supJit),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        curve(
            x + random(-50, 50), y + random(-50, 50),
            x, y,
            x2 + random(-supJit, supJit), y2 + random(-supJit, supJit),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));

        strokeWeight(1)
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
class Boss {
    
}