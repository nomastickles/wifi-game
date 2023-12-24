import * as ex from "excalibur";
import { WifiEntity, WifiEntityCollection } from "./types";
import * as constants from "./constants";
import { Block } from "./Block";
import ouiJson from "./oui.json";

const random = new ex.Random(1337);

export class AppLogic {
  game: ex.Engine;
  matterEngine: Matter.Engine;
  items: WifiEntityCollection = {};
  blocksByItemId: Partial<Record<string, Block>> = {};
  constructor(game: ex.Engine, matter: Matter.Engine) {
    this.game = game;
    this.matterEngine = matter;
    this.init();
  }

  async init() {
    this.game.on(constants.EVENT_ITEMS_INCOMING, (data) =>
      this.handleIncoming(data)
    );
    this.game.on(constants.EVENT_ITEMS_GRAVITY, (_data) =>
      this.handleGravity()
    );
  }

  handleIncoming(data: any) {
    const itemsIncoming = data as WifiEntityCollection;
    // const numItems = Object.keys(itemsIncoming).length;
    Object.values(itemsIncoming).forEach((item) => {
      const { power, numBeacons, macAddress, SSID } = item as WifiEntity;

      const macAddressPrefix = macAddress
        .substr(0, 8)
        .toUpperCase()
        .replace(/:/g, "-");
      const oui = (ouiJson as Record<string, string>)[macAddressPrefix];

      // const name = macAddress;
      const previousItem = this.items[macAddress];
      const previousBlock = this.blocksByItemId[macAddress];

      const newThreshold = Math.min(this.game.getWorldBounds().width / 10, 150);
      let temp = power + newThreshold;

      switch (`${Math.abs(item.power)}`[0]) {
        case "1":
          temp *= 1.5;
          break;
        case "2":
          temp *= 1.4;
          break;
        case "3":
          temp *= 1.3;
          break;
        case "4":
          temp *= 1.2;
          break;
        default:
      }

      const width = temp;
      const height = temp;
      let rotation: number | undefined = undefined;

      const updateKey = `${oui}${SSID}${power}${numBeacons}`;
      const labelText = `${oui}\n${SSID}\n${power}\n${numBeacons}`;
      item.updateKey = updateKey;

      const isUpdate = !!(
        previousItem &&
        previousBlock &&
        previousItem?.updateKey !== updateKey
      );

      if (previousBlock && !isUpdate) {
        return;
      }

      let color = new ex.Color(
        random.integer(0, 255),
        random.integer(0, Math.abs(item.power)),
        random.integer(150, 200)
      );

      let pos = new ex.Vector(
        random.integer(
          this.game.getWorldBounds().width / 2 -
            this.game.getWorldBounds().width / 3,
          this.game.getWorldBounds().width / 2 +
            this.game.getWorldBounds().width / 3
        ),
        random.integer(
          this.game.getWorldBounds().height / 2 -
            this.game.getWorldBounds().height / 3,
          this.game.getWorldBounds().height / 2 +
            this.game.getWorldBounds().height / 3
        )
      );

      switch (`${Math.abs(item.power)}`[0]) {
        case "1":
          pos = new ex.Vector(
            random.integer(
              this.game.getWorldBounds().width / 2 -
                this.game.getWorldBounds().width / 3,
              this.game.getWorldBounds().width / 2 +
                this.game.getWorldBounds().width / 3
            ),
            random.integer(
              this.game.getWorldBounds().height / 2 -
                this.game.getWorldBounds().height / 3,
              this.game.getWorldBounds().height / 2 +
                this.game.getWorldBounds().height / 40
            )
          );
          break;
        case "2":
          pos = new ex.Vector(
            random.integer(
              this.game.getWorldBounds().width / 2 -
                this.game.getWorldBounds().width / 3,
              this.game.getWorldBounds().width / 2 +
                this.game.getWorldBounds().width / 3
            ),
            random.integer(
              this.game.getWorldBounds().height / 2 -
                this.game.getWorldBounds().height / 3,
              this.game.getWorldBounds().height / 2 +
                this.game.getWorldBounds().height / 4
            )
          );
          break;
        default:
      }

      // if (isUpdate) {
      //   previousBlock.matterJs.width = temp / previousBlock.width;
      //   previousBlock.matterJs.height = temp / previousBlock.height;
      //   // previousBlock.setWidth(temp / previousBlock.width);
      //   previousBlock.setScale(
      //     temp / previousBlock.width,
      //     temp / previousBlock.height
      //   );
      // }

      if (isUpdate) {
        pos = previousBlock.pos;
        color = previousBlock.color;
        rotation = previousBlock.rotation;
      }

      const label = new ex.Label({
        text: labelText,
        x: -width / 2 + width / 10,
        y: 0,
        color: ex.Color.fromHex(constants.COLOR_TEXT),
      });

      const newBlock = new Block({
        name: labelText,
        rotation,
        pos,
        width,
        height,
        color,
        z: -1,
      });

      newBlock.addChild(label);

      let timeout = 500;

      setTimeout(() => {
        if (isUpdate) {
          previousBlock.removeEverything(this.game, this.matterEngine);
        }

        this.game.add(newBlock);
        this.items[macAddress] = item;
        this.blocksByItemId[macAddress] = newBlock;
      }, random.integer(0, timeout));
    });

    Object.keys(this.items).forEach((itemId) => {
      if (itemsIncoming[itemId]) {
        return;
      }

      const block = this.blocksByItemId[itemId];
      if (block) {
        block.children.forEach((c) => {
          c.kill();
        });
        block.kill();
      }
      delete this.blocksByItemId[itemId];
      delete this.items[itemId];
    });
  }

  handleGravity() {
    Object.keys(this.blocksByItemId).forEach((key) => {
      const block = this.blocksByItemId[key];
      const item = this.items[key];

      if (block?.name && block.name.includes("wall")) {
        return;
      }

      Object.keys(this.blocksByItemId).forEach((keyOther) => {
        const blockOther = this.blocksByItemId[keyOther];
        const itemOther = this.items[keyOther];
        let inverseForce = false;
        if (block?.name === blockOther?.name) {
          return;
        }

        if (block?.name === blockOther?.name) {
          return;
        }

        if (block?.name && block.name.includes("wall")) {
          inverseForce = true;
        }

        const temp = `${Math.abs(item.power)}`[0];
        const temp2 = `${Math.abs(itemOther.power)}`[0];
        console.log("temp", temp, temp2);

        if (
          `${Math.abs(item.power)}`[0] === `${Math.abs(itemOther.power)}`[0]
        ) {
          block?.gravity(blockOther?.matterJs?.matterJsBody, inverseForce);
        }
      });
    });
  }
}
