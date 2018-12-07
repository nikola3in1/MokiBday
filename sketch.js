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
let sensitivity = height * 1.3
var gravity = 1.5;
//GAME OBJECTS AND DATA
let mokica;
let cakes = [];
let boss;
let totalCakesSpawned = 0;
let crossair;
let images = {};
let font;
let blowedCakes = 0;
let stage = "candle";
//VARIABLES
let lastSpawn = 0;
let offset;
//health bar
let blink = {}
let blinkFrames = 5;
//ANIMTAION
let frame = 0;
//..

function imports() {
    images["cakes"] = [];
    images["mokica"] = loadImage("./assets/mokica.png")
    images["cakes"].push(loadImage("./assets/cake1.png"))
    images["candle"] = loadImage("./assets/candle.png")
    images["boss"] = loadImage("./assets/boss.png")
    images["switch"] = loadImage("./assets/switch.png")
    font = loadFont("assets/font.ttf")
}

function preload() {
    imports();
}
function setup() {
    let canvas = createCanvas(width, height);
    canvas.mousePressed(fire);
    //init spawn offset
    offset = random(150, 2000);
    //init objects
    mic = new p5.AudioIn();
    mokica = new Mokica();
    crossair = new Crossair(crossairSize);
    boss = new Boss();
    //init vars
    blink["frames"] = 0

    //config
    textFont(font);
    mic.start();

    //DEV MODE
    // blowedCakes = 24;
    // stage = "bossintro";
    // boss.health = 0
    // stage = "endgame"
}

function draw() {
    background(1, 1, 1);
    clear()

    if (blowedCakes < 24) {
        //First state
        candlesStage();
    } else if (stage == "bossintro") {
        bossAnimation();
    }
    else if (boss.health > 0) {
        bossStage();
    } else if (stage == "endgame") {
        endGameAnimation();
    } else {
        happyBirthday();
    }

}


////////////////////////////////////////////////////////////////
// States
////////////////////////////////////////////////////////////////

function candlesStage() {
    spawnCakes();
    mokica.display()
    //CAKES 
    for (let i = 0; i < cakes.length; i++) {
        let cake = cakes[i];
        cake.move();
        cake.display();
    }
    mokica.blow()
    crossair.display()
    drawCounter()

}
function bossStage() {
    drawHealth();
    push()
    translate(-width / 3, +height / 6)
    mokica.display("right")
    boss.bounce()
    boss.display()
    mokica.attackBoss()
    pop()
    crossair.display()
}
function happyBirthday() {
    drawMessage()
    mokica.display()
    mokica.blow();
}

////////////////////////////////////////////////////////////////
// Animations
////////////////////////////////////////////////////////////////
function endGameAnimation() {
    push()
    translate(-width / 3, +height / 7)
    boss.animation()
    mokica.animation2()
    pop()
    // drawFocus();
    frame++;
}
function bossAnimation() {
    background(1, 1, 1)
    mokica.animation();
    frame++;
}

////////////////////////////////////////////////////////////////
// Graphics
////////////////////////////////////////////////////////////////
//SETTING STAGE HEREEEE
function drawCounter() {
    image(images['candle'], 7, 10, 40, 70)
    if (blowedCakes == 24) {
        console.log("?asd")
        fill(color(244, 0, 0))
        stage = "bossintro"
    } else {
        fill(0)
    }
    textSize(50)
    text(":" + blowedCakes, 42, 72)
}
function drawHealth() {
    noFill()
    //outer rect
    rect(20, 35 + 15, width - 34, 40)
    if (boss.health < boss.maxHealth * 0.3) {
        if (hpBlink() == 'red') {
            fill(255, 0, 0)
        } else {
            fill(0)
        }
    } else if (boss.health < boss.maxHealth * 0.5) {
        fill(255, 0, 0)
        // fill(255, 123, 0)
    } else {
        fill(0, 155, 38)
    }
    let len = map(boss.health, 0, boss.maxHealth, 0, width - 40)
    if (len > 1) {
        //inner rect       
        rect(23, 37 + 15, len, 35)
    }
    textSize(33)
    fill(0)
    // text("BOSS:", 47, 72)
    text("\"THE CAKE\"", 15, 45)

}
function drawMessage() {
    textSize(80)
    // text("BOSS:", 47, 72)
    let lastX = 60;
    let offset = 40;
    let message = "HAPPY BIRTHDAY MOKICOO!";
    for (let i = 0; i < message.length; i++) {
        const char = message.charAt(i);
        let r = random(0, 255);
        let g = random(0, 255);
        let b = random(0, 255);
        fill(r, g, b);
        text(char, lastX, height / 4);
        lastX += offset;
    }

}
function drawFocus() {
    fill(0);
    rect(0, 0, width, height / 7)
    rect(0, height / 7 * 6, width, height / 7)
}

////////////////////////////////////////////////////////////////
// Util
////////////////////////////////////////////////////////////////
function fire() {
    if (stage == "candle") {
        for (let i = 0; i < cakes.length; i++) {
            const cake = cakes[i];
            let coll = collideCircleCircle(mouseX, mouseY, crossair.size, cake.hitbox['x'], cake.hitbox['y'], cake.hitbox['r'])
            if (coll) {
                cakes.splice(i, 1)
                break;
            }
        }
    } else {
        boss.health -= 10000
    }
}
function spawnCakes() {
    let currTime = Date.now();
    if (totalCakesSpawned < years && lastSpawn + offset < currTime) {
        offset = random(400, 800);
        lastSpawn = Date.now() + offset;
        cakes.push(new Cake())
        totalCakesSpawned++;
    }
}

function hpBlink() {
    blinkFrames = map(boss.health, 0, boss.maxHealth * 0.3, 1, 10)
    if (blink['frames'] > blinkFrames) {
        blink['on'] = !blink['on']
        blink['frames'] = 0;
    }
    blink['frames']++;

    if (blink['on']) {
        return "red";
    } else {
        return "black";
    }
}
////////////////////////////////////////////////////////////////
// Classes
////////////////////////////////////////////////////////////////

// let dmgDealt = 0;
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
        this.blowRealese = 60;
        this.blowFrames = 0;
    }

    attackBoss() {
        //dodaj dmg stats ako imas vreme
        //DEV MODE
        let blowPower = this.blow();
        if (blowPower > sensitivity * boss.difficulty) {
            //Deal dmg
            boss.health -= blowPower;
            if (boss.health < 1) {
                frame = 0;
                stage = "endgame"
            }
        }
    }

    blow(anim) {
        // Get the overall volume (between 0 and 1.0)
        this.blowFrames++;

        if (!anim && this.blowRealese < this.blowFrames) {
            this.blowFrames = 0;
            return;
        }
        var vol = mic.getLevel();
        var length = map(vol, 0, 1, 0, sensitivity);
        let x2 = mouseX;
        let y2 = mouseY;
        if (anim) {
            length = sensitivity * 0.8;
            x2 = width / 3 * 2
            y2 = 350
        }

        if (length < 60) {
            return;
        }

        let x = 505;
        let y = 403;
        if (this.facing == "right") {
            x += 20;
        }



        let distance = dist(x, y, x2, y2)
        let ratio = length / distance;

        x2 = lerp(x, ratio * x2 + (1 - ratio) * x, 0.9);
        y2 = lerp(y, ratio * y2 + (1 - ratio) * y, 0.9);

        stroke('rgba(0,0,0,0.50)');
        strokeWeight(3)

        let minRng = -250; let maxRng = 250;
        let supJit = map(length, 0, sensitivity, 10, 80);

        if (stage == "candle") {
            for (let i = 0; i < cakes.length; i++) {
                const cake = cakes[i];
                if (collideLineCircle(x, y, x2, y2, cake.hitbox['x'], cake.hitbox['y'], cake.hitbox['r'])) {
                    cakes.splice(i, 1)
                    blowedCakes++;
                }
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
        // curve(
        //     x + random(-20, 20), y + random(-20, 20),
        //     x, y - 3,
        //     x2 + random(-15, 15), y2 - 3 + random(-15, 15),
        //     x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        // curve(
        //     x + random(-20, 20), y + random(-20, 20),
        //     x, y + 3,
        //     x2 + random(-supJit, supJit), y2 + random(-supJit, supJit),
        //     x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));
        curve(
            x + random(-50, 50), y + random(-50, 50),
            x, y,
            x2 + random(-supJit, supJit), y2 + random(-supJit, supJit),
            x2 + random(minRng, maxRng), y2 + random(minRng, maxRng));

        strokeWeight(1)
        return length;
    }
    display(facing) {
        push()
        if (facing == "right" || mouseX > centerX && facing == null) {
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
    }
    animation2() {
        if (frame < 200) {
            this.display("right");
            this.blow(true);
        } else if (frame < 700) {
            this.display("right");
        } else {
            stage = "msg";
        }
    }
    animation() {
        if (frame < 60) {
            this.display("left");
        } else if (frame < 90) {
            this.display("right");
        } else if (frame < 120) {
            this.display("left");
        } else if (frame < 150) {
            this.display("right");
        } else if (frame < 151) {
            background(1, 1, 1)
        } else if (frame < 300) {
            background(1, 1, 1)
        } else if (frame < 360) {
            fill(255)
            textSize(80)
            text("Pssst.", width - 250, height - 100)
        } else if (frame < 420) {
            fill(255)
            textSize(80)
            text("?!?", centerX, centerY)
        } else if (frame < 425) {
            fill(255)
            textSize(80)
            text("..", centerX - 20, centerY - 20)
        } else if (frame < 432) {
            fill(255)
            textSize(80)
            text("..", centerX - 100, centerY)
        } else if (frame < 439) {
            fill(255)
            textSize(80)
            text("..", centerX - 180, centerY + 20)
        } else if (frame < 446) {
            fill(255)
            textSize(80)
            text("..", centerX - 260, centerY + 40)
        } else if (frame < 453) {
            fill(255)
            textSize(80)
            text("..", centerX - 340, centerY + 60)
        }
        else if (frame < 540) {
            background(1, 1, 1)
        }
        else if (frame < 600) {
            fill(255)
            textSize(80)
            text("Who's there?!", centerX - 370, centerY + 60)
        } else if (frame < 620) {
            background(1, 1, 1)
        } else if (frame < 700) {
            fill(255)
            textSize(80)
            text("Surrrrpriiise...", width - 300, height - 100)
        }
        else if (frame < 705) {
            fill(255)
            textSize(80)
            text("*click*", 50, centerY + 100)
        }
        else if (frame < 780) {
            clear()
            image(images['switch'], 35, 427, 50, 80)
            image(images['mokica'], 87, 319);
            image(images['boss'], 483, 235);
        } else if (frame < 920) {
            clear()
            fill(0)
            textSize(80)
            text("rly???...", 703, 207)
            image(images['switch'], 35, 427, 50, 80)
            image(images['mokica'], 87, 319);
            image(images['boss'], 483, 235);
        } else if (frame < 970) {
            clear()
            image(images['switch'], 35, 427, 50, 80)
            image(images['mokica'], 87, 319);
            image(images['boss'], 483, 235);
        }
        else {
            clear()
            frame=0
            stage = "msg";
        }
    }

}
class Cake {
    constructor() {
        /* 0 = gore; 1 = levo; 2 = dole; 3 = desno*/
        let side = round(random(0, 3));
        switch (side) {
            case 0:
                this.x = random(0, width)
                this.y = -10;
                break;
            case 1:
                this.x = -10;
                this.y = random(0, height)
                break;
            case 2:
                this.x = random(0, width)
                this.y = height + 10;
                break;
            case 3:
                this.x = width + 10;
                this.y = random(0, height);
                break;
        }
        this.side = side;
        // this.startX = this.x;
        // this.startY = this.y;
        this.lerpSpeed = 0.05;
        this.isAlive = false;
        this.img = images['cakes'][0];
        this.hitbox = {};
        this.hitbox["x"] = this.x - this.img.width / 4 + 20;
        this.hitbox["y"] = this.y - this.img.height / 2 + 50;
        this.hitbox["r"] = 60;
        this.randomX = random(250, width)
        this.randomY = random(250, height)
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
        this.x = lerp(this.x, this.randomX, this.lerpSpeed)
        this.y = lerp(this.y, this.randomY, this.lerpSpeed)
    }
}

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

class Boss {
    constructor() {
        this.difficulty = 0.7 // from 0 to 1
        this.health = 150000;
        this.maxHealth = 150000;
        this.hitbox = {};
        this.img = images['boss'];
        this.x = width / 5 * 4;
        this.y = height / 5;

        //animation
        this.speed = 0.0;

    }
    display() {
        image(this.img, this.x, this.y)
    }
    animation() {
        if (frame < 50) {
            this.bounce();
            this.display();

        } else if (frame < 200) {
            this.bounce();
            this.display()
        } else if (frame < 204) {
            this.speed = 0;
            this.bounce();
            this.display()
        } else if (frame < 280 + 10) {
            this.display()
        } else if (frame < 290 + 10) {
            this.display()
            this.step("slow")
        } else if (frame < 360 + 10) {
            this.display()
        } else if (frame < 365 + 10) {
            this.display();
            this.step();
        } else if (frame < 460 + 40) {
            this.display()
        } else {
            this.display()
            this.retreat();
        }
    }
    bounce() {
        this.y += this.speed;
        this.speed += gravity;
        if (this.y > height / 4) {
            this.speed *= -0.95;
            if (this.speed < -13) {
                this.speed = -13
            }
            this.y = height / 4;
        }
    }
    step(type) {
        if (type == "slow") {
            this.x = lerp(this.x, this.x - 0.7, 0.9)
        } else {
            this.x -= 20
        }
    }
    retreat() {
        this.x += 150;
    }
}