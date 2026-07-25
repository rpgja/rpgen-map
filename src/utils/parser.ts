export class ChunkParser {
  static readonly #WHITESPACE = /\s/;
  static readonly #NON_WHITESPACE = /\S/;
  static readonly #DIGIT = /\d/;

  readonly #input: string;
  #position = 0;

  constructor(input: string) {
    this.#input = input;
  }

  isEnded(): boolean {
    return this.#position >= this.#input.length;
  }

  /**
   * 指定位置がトークンと一致するかどうか
   *
   * 数字で終わるトークン（e.g. "#SELEND1"）が
   * 数字の続くチャンク名（e.g. "#SELEND10"）に一致しないようにする
   */
  static #startsWithToken(
    input: string,
    position: number,
    token: string,
  ): boolean {
    if (input[position] !== token[0]) {
      return false;
    }

    if (input.slice(position, position + token.length) !== token) {
      return false;
    }

    const DIGIT = ChunkParser.#DIGIT;

    if (!DIGIT.test(token.at(-1) ?? "")) {
      return true;
    }

    return !DIGIT.test(input[position + token.length] ?? "");
  }

  #skipWhitespace(): void {
    const WHITESPACE = ChunkParser.#WHITESPACE;
    const input = this.#input;
    const len = input.length;

    while (
      this.#position < len &&
      WHITESPACE.test(input[this.#position] ?? "")
    ) {
      this.#position++;
    }
  }

  parseName(): string {
    this.#skipWhitespace();

    const input = this.#input;

    if (input[this.#position] !== "#") {
      throw new Error(`Expected "#" got "${input[this.#position]}"`);
    }

    this.#position++;

    const NON_WHITESPACE = ChunkParser.#NON_WHITESPACE;
    const len = input.length;
    let name = "";

    while (
      this.#position < len &&
      NON_WHITESPACE.test(input[this.#position] ?? "")
    ) {
      name += input[this.#position];
      this.#position++;
    }

    return name;
  }

  /**
   * 終端トークンまでを読み取る
   *
   * nestedStartを渡すと入れ子を数え、対応する終端トークンまでを読み取る
   * （e.g. "#SEL0-0"で開き"#SELEND0"で閉じる入れ子の選択肢）
   */
  parseChunk(end: string, nestedStart?: string): string {
    const input = this.#input;
    const len = input.length;
    let chunk = "";
    let depth = 0;

    while (this.#position < len) {
      if (
        nestedStart !== undefined &&
        ChunkParser.#startsWithToken(input, this.#position, nestedStart)
      ) {
        depth++;
        chunk += nestedStart;
        this.#position += nestedStart.length;

        continue;
      }

      if (ChunkParser.#startsWithToken(input, this.#position, end)) {
        this.#position += end.length;

        if (depth === 0) {
          break;
        }

        depth--;
        chunk += end;

        continue;
      }

      chunk += input[this.#position];
      this.#position++;
    }

    this.#skipWhitespace();

    return chunk;
  }
}

/**
 * オン・オフを表す生の値
 *
 * RPGENではオンを"1"、オフを"0"もしくは未指定で表現する
 */
export const RawFlag = {
  On: "1",
  Off: "0",
} as const;

export type RawFlag = (typeof RawFlag)[keyof typeof RawFlag];

export const parseFlag = (raw: string | undefined): boolean =>
  raw === RawFlag.On;

export const stringifyFlag = (value: boolean): RawFlag =>
  value ? RawFlag.On : RawFlag.Off;

/**
 * Parse comma separated params
 */
export const parseCSP = (input: string): Record<string, string> => {
  const params: Record<string, string> = {};

  for (const [name, value = ""] of input
    .trim()
    .split(",")
    .filter((p) => p.length > 0)
    .map((v) => v.split(":"))) {
    if (!name) {
      continue;
    }

    params[name.trim()] = value;
  }

  return params;
};
