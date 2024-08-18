import { SpriteType, type StillSprite } from "@/types/sprite.js";
import type { Position } from "@/types/types.js";
import type { Brand } from "ts-brand";

/**
 * e.g. "123", "123C"
 */
export type RawTile = Brand<string, "rawTile">;

export const toRawTile = (rawTile: string) => rawTile as RawTile;

export type Tile = {
  sprite: StillSprite;
  position: Position;
  collision: boolean;
};

export const castTile2RawTile = (tile: Tile): RawTile | null => {
  switch (tile.sprite.type) {
    case SpriteType.CustomStillSprite: {
      let rawTile = "";
      rawTile += tile.sprite.id;
      if (tile.collision) {
        rawTile += "C";
      }
      return toRawTile(rawTile);
    }
    case SpriteType.DQStillSprite: {
      // collisionはここでは反映されず、checkWalkableTile(RawTile)にて判定される
      return toRawTile(`${tile.sprite.surface.x}_${tile.sprite.surface.y}`);
    }
    default: {
      return null;
    }
  }
};
