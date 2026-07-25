export declare class ChunkParser {
    #private;
    constructor(input: string);
    isEnded(): boolean;
    parseName(): string;
    /**
     * 終端トークンまでを読み取る
     *
     * nestedStartを渡すと入れ子を数え、対応する終端トークンまでを読み取る
     * （e.g. "#SEL0-0"で開き"#SELEND0"で閉じる入れ子の選択肢）
     */
    parseChunk(end: string, nestedStart?: string): string;
}
/**
 * オン・オフを表す生の値
 *
 * RPGENではオンを"1"、オフを"0"もしくは未指定で表現する
 */
export declare const RawFlag: {
    readonly On: "1";
    readonly Off: "0";
};
export type RawFlag = (typeof RawFlag)[keyof typeof RawFlag];
export declare const parseFlag: (raw: string | undefined) => boolean;
export declare const stringifyFlag: (value: boolean) => RawFlag;
/**
 * Parse comma separated params
 */
export declare const parseCSP: (input: string) => Record<string, string>;
//# sourceMappingURL=parser.d.ts.map