import { HashMap } from "@/utils/collections.js";
import { Position } from "@/types.js";

export type RPGMapInit = {
  initialHeroPosition: Position,
  backgroundImageUrl: string
};

export type RPGMapChunks = HashMap<string, string[]>;

export class RPGMap {
  readonly initialHeroPosition: Position;
  readonly backgroundImageUrl: string;

  constructor(init: RPGMapInit) {
    this.initialHeroPosition = init.initialHeroPosition;
    this.backgroundImageUrl = init.backgroundImageUrl;
  }

  static #parseChunks(input: string): RPGMapChunks {
    const inputLength = input.length;
    const chunks: RPGMapChunks = new HashMap();
    const readToken = (position: number, condition: (ch: string, i: number) => boolean): string => {
      let token = "";

      while (condition(input[position]!, position) && position < inputLength) {
        token += input[position++]!;
      }

      return token;
    };

    for (let i = 0; i < inputLength; i++) {
      // skip whitespaces
      i += readToken(i, ch => /\s/.test(ch)).length;

      if (input[i] === "#") {
        // skip "#"
        i++;

        const name = readToken(i, ch => /\S/.test(ch));

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

  static readonly #DEFAULT_BACKGROUND_IMAGE_URL = "http://i.imgur.com/qiN1und.jpg";

  static #parseInitialHeroPosition(chunks: RPGMapChunks): Position {
    const [x, y] = chunks.get("HERO")?.[0]
      ?.split(",")
      ?.slice(0, 2)
      ?.map(n => parseInt(n))
      ?? [];

    if (x === undefined || y === undefined) {
      // TODO
      throw new TypeError();
    }

    return { x, y };
  }

  static parse(input: string): RPGMap {
    const chunks = RPGMap.#parseChunks(input);

    console.log(chunks);

    const backgroundImageUrl = chunks.get("BGIMG")?.[0] ?? RPGMap.#DEFAULT_BACKGROUND_IMAGE_URL;
    const initialHeroPosition = RPGMap.#parseInitialHeroPosition(chunks);

    return new RPGMap({
      backgroundImageUrl,
      initialHeroPosition
    });
  }
}
