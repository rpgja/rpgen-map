import type { StillSprite } from "@/types/sprite.js";
import type { Position } from "@/types/types.js";

/**
 * e.g. "123", "123C"
 */
export type RawTile = string;

export type Tile = {
  sprite: StillSprite;
  position: Position;
  collision: boolean;
};
