/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="box2d.ts"/>

var canvas = document.createElement("canvas");
canvas.width = $(window).width();
canvas.height = $(window).height();

document.body.appendChild(canvas);
var context = canvas.getContext("2d");

// an array of clickable bodies. You can create from any point on these bodies.
var clickables = [];
var joints = [];

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
bodyDef.position.Set(50, 800 / 30);
var floor = world.CreateBody(bodyDef);
floor.CreateFixture(fixDef);

var rootStart = new b2Vec2(canvas.width / 2 / 30, 800 / 30 - 2);
var rootOffset = new b2Vec2(0, -150 / 30);
var root = createBranch(rootStart, rootOffset, true);
clickables.push(root);

function update(timestamp) {
    joints.forEach((joint) => {
        var angle = joint.GetJointAngle();
        joint.SetMaxMotorTorque(10 + 100 * Math.abs(angle));
        if(angle > Math.PI/2) {
            // break
            world.DestroyJoint(joint);
        }
    });
    world.Step(1/60, 3, 3);
    world.DrawDebugData();

    var maybeOffset = maybeGetOffset();
    if(maybeOffset) {
        debugDraw.DrawSegment(clickedPoint, mouseWorldVec, {color: 0xbbff22})
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

$(document).on("click", (e) => {
    if(clickedPoint == null) {
        console.log("clicked -- scanning for bodies");
        clickables.forEach((body) => {
            console.log("checking body",body);
            var fixture = body.GetFixtureList();
            console.log("checking fixture", fixture);
            if(fixture.TestPoint(mouseWorldVec.Copy())) {
                console.log("got it!");
                clickedPoint = mouseWorldVec.Copy();
                clickedBody = body;
            }
        });
    } else {
        var offset = maybeGetOffset();
        if(offset) {
            console.log("creating tree between ", clickedPoint, "and ", mouseWorldVec);
            var body = createBranch(clickedPoint, offset);

            var jointDef = new b2Joints.b2RevoluteJointDef;
            jointDef.Initialize(clickedBody, body, clickedPoint);
            // jointDef.referenceAngle = bodyDef.angle;
            jointDef.enableMotor = true;
            jointDef.motorSpeed = 0;
            jointDef.maxMotorTorque = 100;
            var joint = world.CreateJoint(jointDef);

            joints.push(joint);

            // var prismaticJointDef = new b2Joints.b2PrismaticJointDef;
            // var direction = offset.Copy();
            // direction.Normalize();
            // prismaticJointDef.Initialize(clickedBody, body, clickedPoint, offset);
            // world.CreateJoint(prismaticJointDef);

            clickedPoint = null;
            clickedBody = null;
        }
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
    bodyDef.angle = Math.atan2(offset.y, offset.x);
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(length/2, length/20);

    var body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    clickables.push(body);
    return body;
}

function maybeGetOffset(): b2Vec2 {
    if(clickedPoint != null) {
        var offset = mouseWorldVec.Copy();
        offset.Subtract(clickedPoint);
        if(offset.Length() > 1) {
            return offset;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

