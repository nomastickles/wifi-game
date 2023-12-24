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
      this.name,
      config.rotation
    );
    this.addComponent(this.matterJs);
  }

  setScale(scaleX: number, scaleY: number) {
    Matter.Body.scale(this.matterJs.matterJsBody, scaleX, scaleY);
    Matter.Body.set(this.matterJs.matterJsBody, "width", this.width);
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

  removeEverything(game: ex.Engine, matterEngine: Matter.Engine) {
    // Matter.clear(this.matterJs)
    // Matter.Composite.remove(this.matterJs.matterJsBody);
    // this.matterJs.matterJsBody.
    // this.kill();
    Matter.Composite.remove(matterEngine.world, this.matterJs.matterJsBody);
    game.remove(this);
  }

  gravity(otherBody?: Matter.Body) {
    if (!otherBody) {
      return;
    }
    gravityApply(this.matterJs.matterJsBody, otherBody);
  }
}

export function newBlock() {}
