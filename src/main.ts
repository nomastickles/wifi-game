import * as ex from "excalibur";
import { AppLogic } from "./AppLogic";
import * as constants from "./constants";
import { MatterJsSystem } from "./matterjs.system";
import { fetchData } from "./utilsData";
import { logger } from "./utilsLogger";
import { createWalls } from "./utilsWalls";

const width = window.innerWidth - 10;
const height = window.innerHeight - 10;

const game = new ex.Engine({
  width,
  height,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  fixedUpdateFps: 60,
  backgroundColor: ex.Color.fromHex(constants.COLOR_BACKGROUND),
});

const matterSystem = new MatterJsSystem();
const matterEngine = matterSystem.matterEngine;
game.currentScene.world.systemManager.addSystem(matterSystem);

createWalls(game);

game.on(constants.EVENT_ITEMS_FETCH, async () => {
  logger("EVENT_ITEMS_FETCH items fetched");
  const items = await fetchData();
  if (!items) {
    return;
  }
  logger("EVENT_ITEMS_FETCH updating");
  game.emit(constants.EVENT_ITEMS_INCOMING, items);
});

game.on("initialize", async () => {
  logger("initialize");
  new AppLogic(game, matterEngine);
});

game.start().then(() => {
  game.emit(constants.EVENT_ITEMS_FETCH);

  // setInterval(() => {
  //   game.emit(constants.EVENT_ITEMS_GRAVITY);
  // }, constants.APPLY_GRAVITY_INTERVAL_MS);

  setInterval(() => {
    game.emit(constants.EVENT_ITEMS_FETCH);
  }, constants.FETCH_ITEMS_INTERVAL_MS);

  // game.remove(game.currentScene);
});
