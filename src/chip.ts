import { checkWalkableTile } from "@/sprite.js";
import { SpriteType, type StillSprite } from "@/types/sprite.js";
import type { RawTile, Tile } from "@/types/tile.js";
import type { Size } from "@/types/types.js";
import { LargeMap } from "@/utils/collections.js";

export type InfinityChipMapKey = `${number},${number}`;

export class InfinityChipMap<T> {
  readonly #map = new LargeMap<InfinityChipMapKey, T>();

  static #hashKey(x: number, y: number): InfinityChipMapKey {
    return `${x},${y}`;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.#map.values();
  }

  get(x: number, y: number): T | undefined {
    return this.#map.get(InfinityChipMap.#hashKey(x, y));
  }

  set(x: number, y: number, value: T): void {
    this.#map.set(InfinityChipMap.#hashKey(x, y), value);
  }
}

export class TileChipMap {
  static readonly MAX_WIDTH = 300;

  static readonly #MAX_WIDTH_BITS = TileChipMap.MAX_WIDTH.toString(2).length;
  static readonly #Y_MASK = Number.parseInt(
    "1".repeat(TileChipMap.#MAX_WIDTH_BITS),
    2,
  );

  static #hashKey(x: number, y: number): number {
    if (x > TileChipMap.MAX_WIDTH || y > TileChipMap.MAX_WIDTH) {
      throw new RangeError();
    }

    return (x << TileChipMap.#MAX_WIDTH_BITS) | y;
  }

  readonly #map = new Map<number, RawTile>();

  getSize(): Size {
    let width = 0;
    let height = 0;

    for (const key of this.#map.keys()) {
      const x = (key >> TileChipMap.#MAX_WIDTH_BITS) + 1;
      const y = (key & TileChipMap.#Y_MASK) + 1;

      if (x > width) {
        width = x;
      }

      if (y > height) {
        height = y;
      }
    }

    return {
      width,
      height,
    };
  }

  set(x: number, y: number, rawTile: RawTile): void {
    const key = TileChipMap.#hashKey(x, y);

    this.#map.set(key, rawTile);
  }

  getRaw(x: number, y: number): RawTile | undefined {
    return this.#map.get(TileChipMap.#hashKey(x, y));
  }

  get(x: number, y: number): Tile | undefined {
    const key = TileChipMap.#hashKey(x, y);
    let rawTile = this.#map.get(key);

    if (!rawTile) {
      return;
    }

    let collision: boolean;
    let sprite: StillSprite;
    if (rawTile.includes("_")) {
      collision = !checkWalkableTile(rawTile);
      const surface = rawTile.split("_");
      sprite = {
        type: SpriteType.DQStillSprite,
        surface: {
          x: Number(surface[0]),
          y: Number(surface[1]),
        },
      };
    } else {
      collision = rawTile.includes("C");
      rawTile = rawTile.replaceAll("C", "");
      sprite = {
        type: SpriteType.CustomStillSprite,
        id: Number(rawTile.match(/\d+/)?.[0]),
      };
    }

    return {
      sprite,
      collision,
      position: {
        x,
        y,
      },
    };
  }
}
