import { WifiEntity, WifiEntityCollection } from "./types";
import * as Papa from "papaparse";

function getFileNumber(fileName: string) {
  return Number.parseInt(fileName.split(".csv")[0].split("-").reverse()[0]);
}
function convertToEntity(
  incoming: any,
  ssidToMacAddressLookup: Record<string, string> = {}
): WifiEntity | undefined {
  try {
    const lastSeen = incoming[" Last time seen"]
      ? new Date(incoming[" Last time seen"].trim())
      : new Date();

    const power = Number.parseInt(incoming[" Power"] || -1);

    const isClient = !!incoming["Station MAC"];
    if (Number.isNaN(power) || power === -1) {
      return;
    }

    const now = new Date();
    if (diffMinutes(lastSeen, now) > 2) {
      return;
    }

    const ssid = (isClient ? incoming[" BSSID"] : incoming[" ESSID"]).trim();
    const data: WifiEntity = {
      macAddress: incoming["Station MAC"] || incoming.BSSID,
      date: lastSeen,
      power: Number.parseInt(incoming[" Power"]),
      numBeacons: Number.parseInt(
        incoming[" # packets"] || incoming[" # beacons"]
      ),
      client: isClient,
      manufacturer: "",
    };

    if (ssid && !ssid.includes("(not associated)")) {
      data.SSID = ssid;
    }

    if (isClient || incoming[" Probed ESSIDs"]) {
      data.macAddressParent =
        ssidToMacAddressLookup[incoming[" Probed ESSIDs"]];
    }

    return data;
  } catch (_err) {
    return;
  }
}

export async function readAirodumpCSV(csv: string) {
  const results: WifiEntityCollection = {};
  const ssidToMacAddressLookup: Record<string, string> = {};

  const sections = csv
    .split("\n")
    .filter((row) => row != "\r")
    .join("\n")
    .split("\nStation MAC");
  const APsRaw = sections[0];
  const clientsRaw = `Station MAC${sections[1]}`;

  const aps = Papa.parse(APsRaw, { header: true });
  const clients = Papa.parse(clientsRaw, { header: true });

  aps.data.forEach((item) => {
    const newItem = convertToEntity(item);
    if (!newItem) {
      return;
    }

    if (newItem.SSID) {
      ssidToMacAddressLookup[newItem.SSID] = newItem.macAddress;
    }

    results[newItem.macAddress] = newItem;
  });

  clients.data.forEach((item) => {
    const newItem = convertToEntity(item, ssidToMacAddressLookup);
    if (newItem) {
      results[newItem.macAddress] = newItem;
    }
  });

  return results;
}

export async function fetchData() {
  try {
    const response = await fetch(`${window.location.origin}/data`);
    const responseText = await response.text();
    const fileNames = responseText.match(/(?<=href=\")(.*)\.csv(?=\">)/g);
    if (!fileNames) {
      return;
    }
    const mostRecentFile = fileNames?.sort((a, b) =>
      getFileNumber(a) > getFileNumber(b) ? -1 : 1
    )[0];

    const response2 = await fetch(
      `${window.location.origin}/data/${mostRecentFile}`
    );
    const responseText2 = await response2.text();
    const mostRecentData = readAirodumpCSV(responseText2);

    return mostRecentData;
  } catch (err) {
    console.log(err);
  }
}

function diffMinutes(date1: Date, date2: Date) {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.round((d2 - d1) / 60000); // Can use Math.floor or Math.ceil depends up to you
}
