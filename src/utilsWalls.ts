import { CollisionType, Color, Engine, vec } from "excalibur";
import { Block } from "./Block";

const width = window.innerWidth - 5;
const height = window.innerHeight - 5;

export function createWalls(game: Engine) {
  const wall1 = new Block({
    name: "wall1",
    pos: vec(width / 2, 0),
    width,
    height: 10,
    color: Color.Black,
    collisionType: CollisionType.Fixed,
  });

  game.add(wall1);

  const wall2 = new Block({
    name: "wall2",
    pos: vec(width / 2, height),
    width,
    height: 10,
    color: Color.Black,
    collisionType: CollisionType.Fixed,
  });

  game.add(wall2);

  const wall3 = new Block({
    name: "wall3",
    pos: vec(0, height / 2),
    width: 10,
    height,
    color: Color.Black,
    collisionType: CollisionType.Fixed,
  });

  game.add(wall3);

  const wall4 = new Block({
    name: "wall4",
    pos: vec(width - 5, height / 2),
    width: 10,
    height,
    color: Color.Black,
    collisionType: CollisionType.Fixed,
  });

  game.add(wall4);
}
