declare var Box2D: any;

var b2Vec2 = Box2D.Common.Math.b2Vec2
,   b2AABB = Box2D.Collision.b2AABB
,   b2BodyDef = Box2D.Dynamics.b2BodyDef
,   b2Body = Box2D.Dynamics.b2Body
,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,   b2Fixture = Box2D.Dynamics.b2Fixture
,   b2World = Box2D.Dynamics.b2World
,   b2MassData = Box2D.Collision.Shapes.b2MassData
,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
,   b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
;

interface b2Vec2 {
    x: number;
    y: number;

Abs():void

Add(v:b2Vec2):void

Copy():b2Vec2

CrossFV(s:number):void

CrossVF(s:number):void

GetNegative():b2Vec2

IsValid():boolean

Length():number

LengthSquared():number

MaxV(b:b2Vec2):void

MinV(b:b2Vec2):void

MulM(A:any):void

Multiply(a:number):void

MulTM(A:any):void

NegativeSelf():void

Normalize():number

Set(x_:number, y_:number):void

SetV(v:b2Vec2):void

SetZero():void

Subtract(v:b2Vec2):void

}
