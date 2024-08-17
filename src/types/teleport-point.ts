import type { Position } from "@/types/types.js";

export type TeleportPointDestination = {
  mapId: number;
  position: Position;
};

export type TeleportPoint = {
  position: Position;
  destination: TeleportPointDestination;
};
