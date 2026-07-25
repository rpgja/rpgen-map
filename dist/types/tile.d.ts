import { type StillSprite } from "../types/sprite.js";
import type { Position } from "../types/types.js";
import type { Brand } from "ts-brand";
/**
 * e.g. "123", "123C"
 */
export type RawTile = Brand<string, "rawTile">;
export declare const toRawTile: (rawTile: string) => RawTile;
/**
 * 当たり判定を持つことを表す接尾辞
 *
 * e.g. "123C"
 */
export declare const RAW_TILE_COLLISION_SUFFIX = "C";
export type Tile = {
    sprite: StillSprite;
    position: Position;
    collision: boolean;
};
export declare const castTile2RawTile: (tile: Tile) => RawTile;
//# sourceMappingURL=tile.d.ts.map