import * as Matter from "matter-js";

const gravityConstant = 0.1;

export function gravityApply(bodyA: Matter.Body, bodyB: Matter.Body) {
  var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
    distanceSq = Matter.Vector.magnitudeSquared(bToA) || 0.0001,
    normal = Matter.Vector.normalise(bToA),
    magnitude = -gravityConstant * ((bodyA.mass * bodyB.mass) / distanceSq),
    force = Matter.Vector.mult(normal, magnitude);

  // to apply forces to both bodies
  Matter.Body.applyForce(bodyA, bodyA.position, Matter.Vector.neg(force));
  Matter.Body.applyForce(bodyB, bodyB.position, force);
}
