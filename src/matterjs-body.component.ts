import { Component, Entity, TransformComponent } from "excalibur";
import * as constants from "./constants";
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
          isStatic: this.isStatic,
          frictionAir: constants.MATTER_FRICTION,
          label: this.label,
          angle: this.rotation || 0,
        }
      );
    }
  }
}
