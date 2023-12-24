import { Component, Entity, TransformComponent } from "excalibur";

import * as Matter from "matter-js";

export class MatterJsBodyComponent extends Component {
  public readonly type = "matterjs.component" as const;
  matterJsBody!: Matter.Body;
  label: string;
  rotation?: number;

  constructor(
    public width: number,
    public height: number,
    public isStatic = false,
    public labelIncoming = "",
    public rotate?: number
  ) {
    super();
    this.label = labelIncoming;
    this.rotation = rotate;

    console.log(" this.rotation", this.rotation);
  }

  onAdd(owner: Entity) {
    const transform = owner.get(TransformComponent);
    if (transform) {
      this.matterJsBody = Matter.Bodies.rectangle(
        transform.pos.x,
        transform.pos.y,
        this.width,
        this.height,
        {
          friction: 0.01,
          label: this.label,
          angle: this.rotation || 0,
        }
      );
    }
  }
}
