import { CollisionType, Color, Engine, vec } from "excalibur";
import { Block } from "./Block";

const width = window.innerWidth - 5;
const height = window.innerHeight - 5;

export function createWalls() {
  const results = [];
  const wall1 = new Block({
    name: "wall1",
    pos: vec(width / 2, 0),
    visible: false,
    width,
    height: 10,
    color: Color.Black,
    collisionType: CollisionType.Active,
  });

  results.push(wall1);

  const wall2 = new Block({
    name: "wall2",
    pos: vec(width / 2, height),
    visible: false,
    width,
    height: 10,
    color: Color.Black,
    collisionType: CollisionType.Active,
  });

  results.push(wall2);

  const wall3 = new Block({
    name: "wall3",
    pos: vec(0, height / 2),
    visible: false,
    width: 10,
    height,
    color: Color.Black,
    collisionType: CollisionType.Active,
  });

  results.push(wall3);

  const wall4 = new Block({
    name: "wall4",
    pos: vec(width - 5, height / 2),
    visible: false,
    width: 10,
    height,
    color: Color.Black,
    collisionType: CollisionType.Active,
  });

  results.push(wall4);

  return results;
}
