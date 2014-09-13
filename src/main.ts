/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="box2d.ts"/>
//
var canvas = document.createElement("canvas");
canvas.width = $(window).width();
canvas.height = $(window).height();

document.body.appendChild(canvas);
var context = canvas.getContext("2d");

var clickables = [];

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
var floor = world.CreateBody(bodyDef).CreateFixture(fixDef);

//create a seed
bodyDef.type = b2Body.b2_staticBody;
fixDef.shape = new b2CircleShape(.3);

bodyDef.position.x = canvas.width / 2 / 30
bodyDef.position.y = 800 / 30 - 2;
var seed = world.CreateBody(bodyDef).CreateFixture(fixDef);
clickables.push(seed);

function update(timestamp) {
    world.Step(1/60, 3, 3);
    world.DrawDebugData();
    requestAnimationFrame(update);
}

requestAnimationFrame(update);

//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(context);
debugDraw.SetDrawScale(30.0);
debugDraw.SetFillAlpha(0.5);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

