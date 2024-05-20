import { DQStaticSprite, FreeStaticSprite, SpriteType } from "./sprite.js";
import { Position } from "./types.js";

export type RawFloorTile = string;

export type FloorTile = {
  sprite: DQStaticSprite | FreeStaticSprite,
  position: Position,
  collision: boolean
};

export class Floor {
  static readonly #MAX_WIDTH = 300;
  static readonly #MAX_HEIGHT = 300;
  static readonly #MAX_SIZE = Floor.#MAX_WIDTH * Floor.#MAX_HEIGHT;
  static readonly #DEFAULT_RAW_FLOOR_TILE = "0_8";

  readonly #rawTiles: RawFloorTile[] = [];

  constructor(initialRawTiles: RawFloorTile[] = []) {
    while (this.#rawTiles.length < Floor.#MAX_SIZE) {
      const i = this.#rawTiles.length;
      const rawTile = initialRawTiles[i] ?? Floor.#DEFAULT_RAW_FLOOR_TILE;

      this.#rawTiles.push(rawTile);
    }
  }

  get(x: number, y: number): FloorTile {
    let rawTile = this.#rawTiles[y * Floor.#MAX_WIDTH + x]!;
    let collision = false;

    console.log(rawTile, this.#rawTiles.slice(0, 50), y * Floor.#MAX_WIDTH + x);

    if (rawTile.endsWith("C")) {
      collision = true;
      rawTile = rawTile.replace(/C$/, "");
    }

    const positions = rawTile.split("_");
    const sprite: FloorTile["sprite"] = positions.length === 2
      ? {
        type: SpriteType.DQStaticSprite,
        id: {
          x: parseInt(positions[x]!),
          y: parseInt(positions[y]!)
        }
      }
      : {
        type: SpriteType.FreeStaticSprite,
        id: parseInt(rawTile)
      };

    return {
      position: { x, y },
      collision,
      sprite
    }
  }
};
