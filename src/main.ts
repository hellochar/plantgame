/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="box2d.ts"/>
/// <reference path="embox2d-html5canvas-debugDraw.ts"/>

var gravity = new Box2D.b2Vec2(0.0, 10.0);

var world = new Box2D.b2World(gravity);

var bd_ground = new Box2D.b2BodyDef();
var ground = world.CreateBody(bd_ground);

var shape0 = new Box2D.b2EdgeShape();
shape0.Set(new Box2D.b2Vec2(0, 600), new Box2D.b2Vec2(1000, 600));
ground.CreateFixture(shape0, 0.0);

var size = 1;
var shape = new Box2D.b2PolygonShape();
shape.SetAsBox(size, size);

var bd = new Box2D.b2BodyDef();
bd.set_type(Box2D.b2_dynamicBody);
bd.set_position(new Box2D.b2Vec2(500, 0));
var body = world.CreateBody(bd);
body.CreateFixture(shape, 5.0);


function update(timestamp) {
    world.Step(1/30, 3, 3);

    requestAnimationFrame(update);
}

requestAnimationFrame(update);

var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
var context = canvas.getContext("2d");

var debugDraw = DebugDraw.setup(context);
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);
