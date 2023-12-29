import * as Matter from "matter-js";
import { GRAVITY_CONSTANT, GRAVITY_DISTANCE_THRESHOLD } from "./constants";

export function gravityApply(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  inverse = false,
  distanceThreshold = GRAVITY_DISTANCE_THRESHOLD
) {
  var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
    distanceSq = Matter.Vector.magnitudeSquared(bToA) || 0.0001,
    normal = Matter.Vector.normalise(bToA),
    magnitude = -GRAVITY_CONSTANT * ((bodyA.mass * bodyB.mass) / distanceSq),
    force = Matter.Vector.mult(normal, magnitude);

  if (Matter.Vector.magnitude(bToA) < distanceThreshold) {
    return;
  }

  if (!inverse) {
    Matter.Body.applyForce(bodyA, bodyA.position, Matter.Vector.neg(force));
    Matter.Body.applyForce(bodyB, bodyB.position, force);
    return;
  }
  Matter.Body.applyForce(bodyA, bodyA.position, force);
  Matter.Body.applyForce(bodyB, bodyB.position, Matter.Vector.neg(force));
}
