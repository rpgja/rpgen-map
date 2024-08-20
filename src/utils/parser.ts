export class ChunkParser {
  static readonly #WHITESPACE = /\s/;
  static readonly #NON_WHITESPACE = /\S/;

  readonly #input: string;
  #position = 0;

  constructor(input: string) {
    this.#input = input;
  }

  isEnded(): boolean {
    return this.#position >= this.#input.length;
  }

  #skipWhitespace(): void {
    const WHITESPACE = ChunkParser.#WHITESPACE;
    const input = this.#input;
    const len = input.length;

    while (
      this.#position < len &&
      WHITESPACE.test(input[this.#position] as string)
    ) {
      this.#position++;
    }

    this.#position = this.#position;
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
      NON_WHITESPACE.test(input[this.#position] as string)
    ) {
      name += input[this.#position];
      this.#position++;
    }

    return name;
  }

  parseChunk(end: string): string {
    const input = this.#input;
    const len = input.length;
    let chunk = "";

    while (this.#position < len) {
      if (
        input[this.#position] === end[0] &&
        input.slice(this.#position, this.#position + end.length) === end
      ) {
        this.#position += end.length;

        break;
      }

      chunk += input[this.#position];
      this.#position++;
    }

    this.#skipWhitespace();

    return chunk;
  }
}

/**
 * Parse comma separated params
 */
export const parseCSP = (input: string): Record<string, string> => {
  const params: Partial<Record<string, string>> = {};

  for (const [name, value = ""] of input
    .trim()
    .split(",")
    .filter((p) => p.length > 0)
    .map((v) => v.split(":"))) {
    if (!name) {
      continue;
    }

    params[name] = value;
  }

  return params as Record<string, string>;
};
