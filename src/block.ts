import * as ex from "excalibur";
import { MatterJsBodyComponent } from "./matterjs-body.component";
import { MatterJsConstraintComponent } from "./matterjs-constraint.component";
import * as Matter from "matter-js";
import { gravityApply } from "./utilsGravity";

export class Block extends ex.Actor {
  matterJs: MatterJsBodyComponent;
  constructor(config: ex.ActorArgs) {
    super(config);

    this.matterJs = new MatterJsBodyComponent(
      this.width,
      this.height,
      config.collisionType === ex.CollisionType.Active,
      this.name
    );
    this.addComponent(this.matterJs);
  }

  setScale(scaleX: number, scaleY: number) {
    Matter.Body.scale(this.matterJs.matterJsBody, scaleX, scaleY);
  }

  addStiffConstraint(pointA: ex.Vector, pointB: ex.Vector) {
    this.addComponent(
      new MatterJsConstraintComponent({
        pointA,
        pointB,
        bodyB: this.matterJs.matterJsBody,
      })
    );
  }

  removeConstraints() {
    const component = this.get(MatterJsConstraintComponent);
    if (component) {
      this.removeComponent(component, true);
    }
  }

  removeEverything() {
    this.removeConstraints();
    this.kill();
  }

  gravity(otherBody?: Matter.Body) {
    if (!otherBody) {
      return;
    }
    gravityApply(this.matterJs.matterJsBody, otherBody);
  }
}

export function newBlock() {}
