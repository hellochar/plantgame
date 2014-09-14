/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="box2d.ts"/>

$("#instructions").click(() => {
    $("#instructions").fadeOut(2000);
});

var branchImage = new Image();
branchImage.src = "branch.png";

var grassImage = new Image();
grassImage.src = "grass.png";

var dirtImage = new Image();
dirtImage.src = "dirt2.jpg";

var BRANCH_RATIO = 31 / 310;

var BREAKING_ANGLE = Math.PI / 2;

var canvas = document.createElement("canvas");
canvas.width = $(window).width();
canvas.height = $(window).height();

document.body.appendChild(canvas);
var context = canvas.getContext("2d");

// an array of clickable bodies. You can create from any point on these bodies.
var clickables = [];
var joints = [];
var branches = [];

var windVec: b2Vec2 = new b2Vec2(0, 0);

var world = new b2World(
   new b2Vec2(0, 10)    //gravity
,  true                 //allow sleep
);

var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;

var bodyDef = new b2BodyDef;

//create ground
bodyDef.type = b2Body.b2_staticBody;
fixDef.shape = new b2PolygonShape;
fixDef.shape.SetAsBox(100, 2);
bodyDef.position.Set(50, canvas.height / 30 + 1);
var floor = world.CreateBody(bodyDef);
floor.CreateFixture(fixDef);

var rootStart = new b2Vec2(canvas.width / 2 / 30, canvas.height / 30);
var rootOffset = new b2Vec2(0, -250 / 30);
var root = createBranch(rootStart, rootOffset, true);
clickables.push(root);


var particles = [];
bodyDef.type = b2Body.b2_dynamicBody;
fixDef.shape = new b2CircleShape;
fixDef.shape.SetRadius(.1);
fixDef.density = 0.01;
fixDef.friction = 0.1;
fixDef.restitution = 0.01;

for(var i = 0; i < 35; i++) {
    // bodyDef.position.Set(Math.random() * canvas.width / DRAW_SCALE, Math.random() * canvas.height / DRAW_SCALE);
    // bodyDef.position = new b2Vec2(Math.random() * canvas.width / DRAW_SCALE, 0);
    bodyDef.position.Set(Math.random() * 20, Math.random() * 20);
    bodyDef.linearDamping = 9;
    var body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    particles.push(body);
    body.life = Math.round(Math.random() * 200);
}

function update(timestamp) {
    joints.forEach((joint) => {
        var jointAngle = joint.GetJointAngle();
        joint.SetMaxMotorTorque(100 + 1200 * Math.abs(jointAngle));

        var angle = jointAngle;
        if(Math.abs(angle) > BREAKING_ANGLE) {
            // break
            var subtree = findSubtreeOf(joint.GetBodyB());
            clickables = clickables.filter((clickable) => {
                return subtree.indexOf(clickable) === -1;
            });
            subtree.forEach((tree) => {
                tree.dead = true;
            });
            world.DestroyJoint(joint);
        }
    });

    windVec.x += (Math.random() - .5) / 30;
    if(windVec.x > 1) windVec.x = 1;
    if(windVec.x < -1) windVec.x = -1;
    branches.forEach((branch) => {
        branch.ApplyForce(windVec, branch.GetWorldCenter());
    });
    particles.forEach((particle) => {
        var force = windVec.Copy();
        force.Multiply(.001);
        particle.ApplyForce(force, particle.GetWorldCenter());
        particle.life = particle.life || 0;
        particle.life += 1;
        particle.oldPosition = particle.GetWorldCenter();
    });

    world.Step(1/60, 3, 3);
    world.DrawDebugData();

    particles.forEach((particle) => {
        var position = particle.GetWorldCenter();
        if(position.x < 0 || position.x * DRAW_SCALE > canvas.width ||
           position.y < 0 || position.y * DRAW_SCALE > canvas.height ||
           particle.life > 200) {
            particle.SetPosition(new b2Vec2(Math.random() * canvas.width / DRAW_SCALE, Math.random() * (canvas.height - 60) / DRAW_SCALE));
            particle.SetLinearVelocity(new b2Vec2(0, 0));
            particle.life = 0;
       }
    });

    var treeAABB;

    branches.forEach((branch) => {
        if(!branch.dead) {
            if(treeAABB == null) {
                treeAABB = branch.GetFixtureList().GetAABB();
            } else {
                treeAABB = b2AABB.Combine(treeAABB, branch.GetFixtureList().GetAABB());
            }
        }
        var angle: number = branch.GetAngle();
        var position: b2Vec2 = branch.GetWorldCenter();
        var halfLength = branch.halfLength;
        var halfWidth = branch.halfWidth;

        context.save();
        context.translate(position.x * DRAW_SCALE, position.y * DRAW_SCALE);
        context.rotate(angle + Math.PI/2);
        context.scale(halfLength * 2 / branchImage.height * DRAW_SCALE, halfWidth * 2 / branchImage.width * DRAW_SCALE);
        context.drawImage(branchImage, -branchImage.width/2, -branchImage.height/2);
        context.restore();
    });
    var height = treeAABB.upperBound.y - treeAABB.lowerBound.y;
    $("#height").text((height/10).toFixed(2) + " ft.").css({
        bottom: (height * DRAW_SCALE + 50).toFixed(0)
    });

    (() => {
        context.save();
        var y = canvas.height - grassImage.height;
        context.drawImage(grassImage, 0, y);
        context.drawImage(grassImage, -100, y);
        context.drawImage(grassImage, 200, y);
        context.drawImage(grassImage, 350, y);
        context.drawImage(grassImage, 540, y);
        context.drawImage(grassImage, 700, y);
        context.drawImage(grassImage, 400, y);
        context.drawImage(grassImage, 900, y);
        context.drawImage(grassImage, 1200, y);
        context.restore();
    })();

    var maybeOffset = maybeGetOffset();
    if(maybeOffset) {
        var length = maybeOffset.Length();
        if(canPlaceAtOffset(maybeOffset)) {
            context.lineWidth = length * BRANCH_RATIO * DRAW_SCALE;
            debugDraw.DrawSegment(clickedPoint, mouseWorldVec, { color: 0xbbff22 });
        }

        context.lineWidth = 1.0;
        context.strokeStyle = "rgba(0, 0, 0, .25)";
        var angle = clickedBody.GetAngle();
        context.beginPath();
        context.arc(clickedPoint.x * DRAW_SCALE, clickedPoint.y * DRAW_SCALE, length * DRAW_SCALE, 0, Math.PI*2);
        context.stroke();
    }
    requestAnimationFrame(update);
}

requestAnimationFrame(update);

var DRAW_SCALE = 30;

//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(context);
debugDraw.SetDrawScale(DRAW_SCALE);
debugDraw.SetFillAlpha(0.5);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

world.SetDebugDraw(debugDraw);


var mouseX: number, mouseY: number;
var mouseWorldVec: b2Vec2;

$(document).on("mousemove mousedown mouseup click", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    mouseWorldVec = new b2Vec2(mouseX / DRAW_SCALE, mouseY / DRAW_SCALE);
});

var clickedPoint: b2Vec2;
var clickedBody: any;

$(document).on("mousedown", (e) => {
    if(clickedPoint == null) {
        clickables.forEach((body) => {
            var fixture = body.GetFixtureList();
            if(fixture.TestPoint(mouseWorldVec.Copy())) {
                clickedPoint = mouseWorldVec.Copy();
                clickedBody = body;
            }
        });
    } else {
        var offset = maybeGetOffset();
        if( canPlaceAtOffset(offset) ) {
            var body = createBranch(clickedPoint, offset);

            var jointDef = new b2Joints.b2RevoluteJointDef;
            jointDef.Initialize(clickedBody, body, clickedPoint);
            jointDef.enableMotor = true;
            jointDef.motorSpeed = 0;
            jointDef.maxMotorTorque = 100;
            var joint = world.CreateJoint(jointDef);

            joints.push(joint);

        }
        clickedPoint = null;
        clickedBody = null;
    }
});

function createBranch(start: b2Vec2, offset: b2Vec2, staticBody: boolean = false) {
    var midpoint = new b2Vec2(start.x + offset.x / 2,
                              start.y + offset.y / 2);
    var length = offset.Length();
    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    bodyDef.type = staticBody ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    bodyDef.position.SetV(midpoint);
    bodyDef.angle = angleOf(offset);
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(length/2, length/2 * BRANCH_RATIO);

    var body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    clickables.push(body);
    branches.push(body);
    body.halfLength = length / 2;
    body.halfWidth = length / 2 * BRANCH_RATIO;
    return body;
}

function maybeGetOffset(): b2Vec2 {
    if(clickedPoint != null) {
        var offset = mouseWorldVec.Copy();
        offset.Subtract(clickedPoint);
        if(offset.Length() > .2) {
            return offset;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function canPlaceAtOffset(offset: b2Vec2) {
    return !!offset;
}

function angleBetween(a: number, b: number) {
    var angle = Math.abs(a - b);
    if(angle > Math.PI) {
        angle = 2*Math.PI - angle;
    }

    return angle;
}

function angleOf(v: b2Vec2) {
    return Math.atan2(v.y, v.x);
}

function findSubtreeOf(body: any) {
    var trees = [];
    for(var joint = body.GetJointList(); joint != null; joint = joint.next) {
        // only find me if i'm body A
        if(body === joint.joint.GetBodyA()) {
            trees = trees.concat(findSubtreeOf(joint.joint.GetBodyB()));
        }
    }
    trees.push(body);
    return trees;
}

var audioContext = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
var bufferSize = 4096;
var brownNoise = (function() {
    var lastOut = 0.0;
    var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
            output[i] *= Math.min(windVec.Length(), 1);
        }
    }
    return node;
})();

brownNoise.connect(audioContext.destination);
