import { type RawTile, type Tile } from "./types/tile.js";
import type { Size } from "./types/types.js";
export type InfinityChipMapKey = `${number},${number}`;
export declare class InfinityChipMap<T> {
    #private;
    [Symbol.iterator](): IterableIterator<T>;
    get(x: number, y: number): T | undefined;
    set(x: number, y: number, value: T): void;
}
export declare class TileChipMap {
    #private;
    static readonly MAX_WIDTH = 300;
    getSize(): Size;
    set(x: number, y: number, rawTile: RawTile): void;
    getRaw(x: number, y: number): RawTile | undefined;
    get(x: number, y: number): Tile | undefined;
}
//# sourceMappingURL=chip.d.ts.map