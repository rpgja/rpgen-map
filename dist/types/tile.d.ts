import { type StillSprite } from "../types/sprite.js";
import type { Position } from "../types/types.js";
import type { Brand } from "ts-brand";
/**
 * e.g. "123", "123C"
 */
export type RawTile = Brand<string, "rawTile">;
export declare const toRawTile: (rawTile: string) => RawTile;
export type Tile = {
    sprite: StillSprite;
    position: Position;
    collision: boolean;
};
export declare const castTile2RawTile: (tile: Tile) => RawTile;
//# sourceMappingURL=tile.d.ts.map