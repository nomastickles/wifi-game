export interface LogEntry {
  type: "log" | "info" | "error";
  message: string;
  logFile?: string;
}

export interface WifiEntity {
  name?: string;
  macAddress: string;
  manufacturer?: string;
  /** either what the AP is broadcasting
   * or what the client is requesting
   */
  SSID?: string;

  macAddressParent?: string;

  /**
   * last seed / timestamp
   */
  date: Date;
  power: number;
  numBeacons: number;

  /**
   * Assume client === false means AP
   */
  client: boolean;
}

export type WifiEntityCollection = Record<string, WifiEntity>;
