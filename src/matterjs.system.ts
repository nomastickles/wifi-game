import * as ex from "excalibur";
import { MatterJsBodyComponent } from "./matterjs-body.component";

import * as Matter from "matter-js";
import { MatterJsConstraintComponent } from "./matterjs-constraint.component";
import * as constants from "./constants";

export class MatterJsSystem extends ex.System<
  MatterJsBodyComponent | ex.TransformComponent
> {
  public readonly types = ["matterjs.component", "ex.transform"] as const;
  public systemType = ex.SystemType.Update;

  matterEngine: Matter.Engine = Matter.Engine.create({
    timing: {
      timeScale: constants.TIME_SCALE,
    },
    gravity: {
      x: 0,
      y: 0,
    },
  });

  constructor() {
    super();
  }

  initialize() {
    ex.Physics.enabled = false;
  }

  override notify(msg: ex.AddedEntity | ex.RemovedEntity) {
    if (!ex.isAddedSystemEntity(msg)) {
      return;
    }
    // Add bodies to the matter world
    const matterJsComponent = msg.data.get(MatterJsBodyComponent);

    if (matterJsComponent) {
      Matter.Composite.add(
        this.matterEngine.world,
        matterJsComponent.matterJsBody
      );
    }

    // Optional component
    const matterJsConstraint = msg.data.get(MatterJsConstraintComponent);
    if (matterJsConstraint) {
      Matter.Composite.add(
        this.matterEngine.world,
        matterJsConstraint.constraint
      );
      matterJsConstraint.removed$.subscribe(() => {
        Matter.World.remove(
          this.matterEngine.world,
          matterJsConstraint.constraint
        );
      });
    }
  }

  override update(entities: ex.Entity[], delta: number) {
    // Update matter js simulation
    Matter.Engine.update({ ...this.matterEngine }, delta);
    // Sync transforms from matter to excalibur

    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];

      const transform = entity.get(ex.TransformComponent);
      const matterJsComponent = entity.get(MatterJsBodyComponent);

      if (!matterJsComponent || !transform) {
        return;
      }

      transform.pos.x = matterJsComponent.matterJsBody.position.x;
      transform.pos.y = matterJsComponent.matterJsBody.position.y;
      // transform.rotation = matterJsComponent.matterJsBody.angle;
      // keeping rotation at 0 for now; easier to read
      transform.rotation = 0;
    }
  }
}
