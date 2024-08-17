const MAX_FORCE = 0.2;
const MAX_SPEED = 2;

const ALIGN_PERCEP_RADIUS = 50;
const SEPAR_PERCEP_RADIUS = 50;
const COHES_PERCEP_RADIUS = 80;

const BOID_STROKE = 5;
const BOIDS = 100;

class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.maxForce = MAX_FORCE;
        this.maxSpeed = MAX_SPEED;
    }

    edges() {
        if (this.position.x > width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        else if (this.position.y < 0) this.position.y = height;
    }

    align(boids) {
        let perceptionRadius = ALIGN_PERCEP_RADIUS;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let perceptionRadius = SEPAR_PERCEP_RADIUS;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        strokeWeight(BOID_STROKE);
        stroke(255);
        point(this.position.x, this.position.y);
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }
}

const flock = [];

function setup() {
    // Create and append the container dynamically
    let body = select('body');
    let container = createElement('div');
    container.id('flocking-container');
    container.style('position', 'absolute');
    container.style('top', '0');
    container.style('left', '0');
    container.style('width', '100%');
    container.style('height', '100%');
    container.style('z-index', '-1');  // Ensures the container stays in the background
    body.child(container);

    // Create the canvas to fill the entire window
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('flocking-container');

    for (let i = 0; i < BOIDS; i++) {
        flock.push(new Boid());
    }
}

function draw() {
    background(51);
    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.show();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);  // Adjust canvas size when window is resized
}