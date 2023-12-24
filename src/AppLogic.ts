import * as ex from "excalibur";
import { WifiEntity, WifiEntityCollection } from "./types";
import * as constants from "./constants";
import { Block } from "./Block";
import ouiJson from "./oui.json";

const random = new ex.Random(1337);

export class AppLogic {
  game: ex.Engine;
  items: WifiEntityCollection = {};
  blocksByItemId: Partial<Record<string, Block>> = {};
  constructor(game: ex.Engine) {
    this.game = game;
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
      const temp = power + newThreshold;
      const width = temp;
      const height = temp;

      const labelText = `${oui}\n${SSID}\n${power}\n${numBeacons}`;
      item.name = labelText;

      const isUpdate = !!(
        previousItem &&
        previousBlock &&
        previousItem.name !== labelText
      );

      if (previousBlock && !isUpdate) {
        return;
      }

      const label = new ex.Label({
        text: labelText,
        x: -width / 2 + width / 10,
        y: 0,
      });

      let color = new ex.Color(
        random.integer(0, 255),
        random.integer(0, 255),
        random.integer(0, 255)
      );

      let pos = new ex.Vector(
        random.integer(
          this.game.getWorldBounds().width / 2 -
            this.game.getWorldBounds().width / 4,
          this.game.getWorldBounds().width / 2 +
            this.game.getWorldBounds().width / 4
        ),
        random.integer(
          this.game.getWorldBounds().height / 2 -
            this.game.getWorldBounds().height / 4,
          this.game.getWorldBounds().height / 2 +
            this.game.getWorldBounds().height / 4
        )
      );

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
      }

      const newBlock = new Block({
        name: labelText,
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
          this.game.remove(previousBlock);
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
    Object.values(this.blocksByItemId).forEach((block) => {
      Object.values(this.blocksByItemId).forEach((blockOther) => {
        if (block?.name === blockOther?.name) {
          return;
        }

        if (block?.name && block.name.includes("wall")) {
          return;
        }
        block?.gravity(blockOther?.matterJs?.matterJsBody);
      });
    });
  }
}
