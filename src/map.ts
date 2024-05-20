import { HashMap } from "@/utils/collections.js";
import { Position, SPoint } from "@/types.js";
import { Floor } from "./floor.js";

export type RPGMapInit = {
  initialHeroPosition: Position;
  backgroundImageUrl: string;
  sPoints: SPoint[],
  floor: Floor
};

export type RPGMapChunks = HashMap<string, string[]>;

export class RPGMap {
  readonly initialHeroPosition: Position;
  readonly backgroundImageUrl: string;
  readonly sPoints: SPoint[];
  readonly floor: Floor;

  constructor(init: RPGMapInit) {
    this.initialHeroPosition = init.initialHeroPosition;
    this.backgroundImageUrl = init.backgroundImageUrl;
    this.floor = init.floor;
    this.sPoints = init.sPoints;
  }

  static #parseChunks(input: string): RPGMapChunks {
    const inputLength = input.length;
    const chunks: RPGMapChunks = new HashMap();
    const readToken = (
      position: number,
      condition: (ch: string, i: number) => boolean
    ): string => {
      let token = "";

      while (condition(input[position]!, position) && position < inputLength) {
        token += input[position++]!;
      }

      return token;
    };

    for (let i = 0; i < inputLength; i++) {
      // skip whitespaces
      i += readToken(i, (ch) => /\s/.test(ch)).length;

      if (input[i] === "#") {
        // skip "#"
        i++;

        const name = readToken(i, (ch) => /\S/.test(ch));

        i += name.length;

        const value = readToken(i, (ch, i) => {
          if (ch !== "#") {
            return true;
          }

          return input.slice(i, i + 4) !== "#END";
        });

        i += value.length;

        const values = chunks.get(name, []);

        values.push(value.trim());
      }
    }

    return chunks;
  }

  static readonly #DEFAULT_BACKGROUND_IMAGE_URL =
    "http://i.imgur.com/qiN1und.jpg";

  static #parseInitialHeroPosition(chunks: RPGMapChunks): Position {
    const [x, y] =
      chunks
        .get("HERO")?.[0]
        ?.split(",")
        ?.slice(0, 2)
        ?.map((n) => parseInt(n)) ?? [];

    if (x === undefined || y === undefined) {
      // TODO
      throw new TypeError();
    }

    return { x, y };
  }

  static #parseFloor(chunks: RPGMapChunks): Floor {
    const rawFloor = chunks.get("FLOOR")?.[0]?.split(/\r?\n/)?.flatMap(l => l.split(/\s+/)) ?? [];
    const floor = new Floor(rawFloor);

    return floor;
  }

  static #parseSPoint(chunks: RPGMapChunks): SPoint[] {
    const sPointChunks = chunks.get("SPOINT");
    if (!sPointChunks) {
      return [];
    }
    const sPoints: SPoint[] = [];
    for (const chunk of sPointChunks) {
      const arr = chunk.split(",");
      const [x, y] = arr.slice(0, 2).map(parseInt);
      if (x === undefined || y === undefined) {
        // TODO
        throw new TypeError();
      }
      const once = arr.at(2) === "1"; // ToDo: fix
      const msg = String(arr.at(3));
      sPoints.push({
        at: {
          x,
          y,
        },
        once,
        msg,
      });
    }
    return sPoints;
  }

  static parse(input: string): RPGMap {
    const chunks = RPGMap.#parseChunks(input);

    console.log(chunks);

    const backgroundImageUrl =
      chunks.get("BGIMG")?.[0] ?? RPGMap.#DEFAULT_BACKGROUND_IMAGE_URL;
    const initialHeroPosition = RPGMap.#parseInitialHeroPosition(chunks);
    const sPoints = RPGMap.#parseSPoint(chunks);
    const floor = RPGMap.#parseFloor(chunks);

    console.log(floor);

    return new RPGMap({
      backgroundImageUrl,
      initialHeroPosition,
      sPoints,
      floor
    });
  }
}
