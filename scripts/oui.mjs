import * as fs from "fs";
import { execSync } from "child_process";

execSync("curl -O https://standards-oui.ieee.org/oui/oui.txt");

const oui = fs.readFileSync("./oui.txt", "utf8");

console.log("oui");

const results = {};

try {
  oui.split("\n").forEach((line) => {
    if (!line.includes("(hex)")) {
      return;
    }

    const macPrefix = line.split("(hex)")[0].trim();
    const man = line.split("(hex)")[1].trim();
    results[macPrefix] = man;
  });

  fs.writeFileSync("../src/oui.json", JSON.stringify(results, null, 2));
} catch (error) {
  console.error(error);
}
