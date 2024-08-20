export class RawCommand {
  readonly #name: string;
  readonly #body: string;

  constructor(name: string, body: string) {
    this.#name = name;
    this.#body = body;
  }

  toString(): string {
    let s = `#${this.#name}${this.#body}`;

    if (this.#name.startsWith("SEL")) {
      s += `#SELEND${this.#name.match(/\d+$/)?.[0]}`;
    } else {
      s += "#ED";
    }

    return s;
  }

  parse(): Command {
    throw new Error("Unimplemented");
  }
}

export type Command = never;
