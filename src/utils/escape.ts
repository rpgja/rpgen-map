const ESCAPE_MAP = [
  [",", "[、]"],
  ["#", "[#]"],
] as const;

const escapeMap = new Map(ESCAPE_MAP);

const unescapeMap = new Map(ESCAPE_MAP.map((v) => [v[1], v[0]]));

type EscapeFunction = (input: string) => string;

const createEscapeFunction =
  (escapeMap: ReadonlyMap<string, string>): EscapeFunction =>
  (input) => {
    let s = input;

    for (const [raw, escaped] of escapeMap) {
      s = s.replaceAll(raw, escaped);
    }

    return s;
  };

export const escapeMetaChars: EscapeFunction = createEscapeFunction(escapeMap);

export const unescapeMetaChars: EscapeFunction =
  createEscapeFunction(unescapeMap);
