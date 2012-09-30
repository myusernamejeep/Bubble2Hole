// Create a new layer
 var winSize;
var PhysicsDemoLayer = cc.Layer.extend({
    world: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,
	ctor:function () {
        cc.associateWithNative( this, cc.Layer );
    },
 
    init:function () {
        var bRet = false;
        if (this._super()) {
        
        	//PhysicsDemoLayer.superclass.constructor.call(this)
			this.isMouseEnabled = true
			this.bodies = []
			// Get size of canvas
			var s = cc.Director.getInstance().getWinSize();
            this.demo();
    		this.scheduleUpdate() ;
            bRet = true;
            //var canvas = document.getElementById('gameCanvas');//.getContext("2d");
            //var self = this;
            //this.addEventListener('mousedown', self.mouseDown, true)
        	//this.addEventListener('mousemove', self.mouseMoved, true)
        }

        return bRet;
    },
    createCrate: function (point, scale) {
        scale = scale || 1
        //var sprite = new cc.Sprite({url: 'assets/crate.jpg'})
        var sprite = cc.Sprite.create(s_crate);
        //sprite.position = point
		sprite.setAnchorPoint(cc.p(0,0));
        sprite.setPosition(point);
         
        sprite.scale = scale /2

        this.addChild(sprite)
        return sprite
    },

    createBall: function (point, scale) {
        scale = scale || 1
        //var sprite = new cc.Sprite({url: 'assets/ball.png'})
        var sprite = cc.Sprite.create(s_ball);
        
        console.log(point);
        //sprite.position = point
		sprite.setAnchorPoint(cc.p(0,0));
        sprite.setPosition(point);
            
        sprite.scale = scale

        this.addChild(sprite)
        return sprite
    },

    update: function (dt) {
        var world = this.world,
            mouseJoint = this.mouseJoint

        world.Step(dt, 10, 10)
        world.ClearForces()
 
        var bodies = this.bodies
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
                pos = body.GetPosition(),
                angle = cc.RADIANS_TO_DEGREES(-body.GetAngle())
            //body.sprite.position = 
            var point = new cc.Point(pos.x * 30, pos.y * 30)
			body.sprite.setPosition(point);
        	body.sprite.setRotation(angle);
            //body.sprite.rotation = angle

        } 
    
    },

    demo: function () {
        var world = new b2World(
            new b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        )
        this.world = world


        var fixDef = new b2FixtureDef
        fixDef.density = 1.0
        fixDef.friction = 0.5
        fixDef.restitution = 0.2

        var bodyDef = new b2BodyDef

        //create ground
        bodyDef.type = b2Body.b2_staticBody
        fixDef.shape = new b2PolygonShape
        fixDef.shape.SetAsBox(20, 2)
        bodyDef.position.Set(10, 400 / 30 + 2)
        world.CreateBody(bodyDef).CreateFixture(fixDef)
        bodyDef.position.Set(10, -2)
        world.CreateBody(bodyDef).CreateFixture(fixDef)
        fixDef.shape.SetAsBox(2, 14)
        bodyDef.position.Set(-2, 13)
        world.CreateBody(bodyDef).CreateFixture(fixDef)
        bodyDef.position.Set(22, 13)
        world.CreateBody(bodyDef).CreateFixture(fixDef)


        //create some objects
        bodyDef.type = b2Body.b2_dynamicBody
        for (var i = 0; i < 15; ++i) {
            var sprite
            bodyDef.position.x = Math.random() * 15
            bodyDef.position.y = Math.random() * 15
            var scale = (Math.random() + 0.5),
                width = scale * 32
            if (Math.random() > 0.5) {
                fixDef.shape = new b2PolygonShape
                fixDef.shape.SetAsBox(width/30, width/30)
                sprite = this.createCrate(new cc.Point(bodyDef.position.x * 30, bodyDef.position.y * 30), scale)
            } else {
                fixDef.shape = new b2CircleShape(width/30)
                sprite = this.createBall(new cc.Point(bodyDef.position.x * 30, bodyDef.position.y * 30), scale)
            }

            var bdy = world.CreateBody(bodyDef)
            bdy.sprite = sprite
            this.bodies.push(bdy)
            bdy.CreateFixture(fixDef)
        }
 
        /*
        //setup debug draw
        var debugDraw = new b2DebugDraw()
            debugDraw.SetSprite(document.getElementById('debug-canvas').getContext("2d"))
            debugDraw.SetDrawScale(30.0)
            debugDraw.SetFillAlpha(0.5)
            debugDraw.SetLineThickness(1.0)
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit)
            world.SetDebugDraw(debugDraw)
       */
    }, 

    getBodyAtPoint: function (point) {
        point = new cc.Point(point.x /30, point.y /30)
        var world = this.world
        var mousePVec = new b2Vec2(point.x, point.y)
        var aabb = new b2AABB()
        aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001)
        aabb.upperBound.Set(point.x + 0.001, point.y + 0.001)


        var self = this
        function getBodyCB(fixture) {
            if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    self.selectedBody = fixture.GetBody()

                    return false
                }
            }
            return true
        }


        // Query the world for overlapping shapes.

        this.selectedBody = null

        world.QueryAABB(getBodyCB, aabb)
        
        //console.log(this.selectedBody);
        return this.selectedBody
    },
	 onTouchesBegan:function (touches, event) {
        if (!this.isMouseDown) {
            var point = evt.locationInCanvas,
            world = this.world,
            mouseJoint = this.mouseJoint

			if (!mouseJoint) {
				var body = this.getBodyAtPoint(point)
				console.log(point);
				if(body) {
					console.log(body);
					var md = new b2MouseJointDef()
					md.bodyA = world.GetGroundBody()
					md.bodyB = body
					md.target.Set(point.x /30, point.y /30)
					md.collideConnected = true
					md.maxForce = 300.0 * body.GetMass()
					mouseJoint = world.CreateJoint(md)
					body.SetAwake(true)
					this.mouseJoint = mouseJoint
	
				}
			}
        }
        this.isMouseDown = true;
    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            var point = evt.locationInCanvas,
            world = this.world,
            mouseJoint = this.mouseJoint

			if (mouseJoint) {
				mouseJoint.SetTarget(new b2Vec2(point.x /30, point.y /30))
			}
        }
    },
    onTouchesEnded:function () {
        this.isMouseDown = false;
        var mouseJoint = this.mouseJoint,
            world = this.world

        if (mouseJoint) {
            world.DestroyJoint(mouseJoint)
            this.mouseJoint = null

        }
    },
    mouseDown: function (evt) {
        var point = evt.locationInCanvas,
            world = this.world,
            mouseJoint = this.mouseJoint

        if (!mouseJoint) {
            var body = this.getBodyAtPoint(point)
            console.log(point);
            if(body) {
            	console.log(body);
                var md = new b2MouseJointDef()
                md.bodyA = world.GetGroundBody()
                md.bodyB = body
                md.target.Set(point.x /30, point.y /30)
                md.collideConnected = true
                md.maxForce = 300.0 * body.GetMass()
                mouseJoint = world.CreateJoint(md)
                body.SetAwake(true)
                this.mouseJoint = mouseJoint

            }
        }
    },

    mouseDragged: function (evt) {
        var point = evt.locationInCanvas,
            world = this.world,
            mouseJoint = this.mouseJoint

        if (mouseJoint) {
            mouseJoint.SetTarget(new b2Vec2(point.x /30, point.y /30))
        }
    },
  
    mouseUp: function (evt) {
        var mouseJoint = this.mouseJoint,
            world = this.world

        if (mouseJoint) {
            world.DestroyJoint(mouseJoint)
            this.mouseJoint = null

        }
    },
    backCallback:function (pSender) {
        var scene = cc.Scene.create();
        scene.addChild(SysMenu.create());
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.2, scene));
    }
})
 

PhysicsDemoLayer.create = function () {
    var sg = new PhysicsDemoLayer();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};
