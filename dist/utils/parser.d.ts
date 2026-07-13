export declare class ChunkParser {
    #private;
    constructor(input: string);
    isEnded(): boolean;
    parseName(): string;
    parseChunk(end: string): string;
}
/**
 * Parse comma separated params
 */
export declare const parseCSP: (input: string) => Record<string, string>;
//# sourceMappingURL=parser.d.ts.map