import { unescapeMetaChars } from "../utils.js";
import { ChunkParser, parseCSP, parseFlag } from "../utils/parser.js";
/**
 * 通常のコマンドの終端
 */
const COMMAND_TERMINATOR = "#ED";
/**
 * 選択肢のコマンド名
 *
 * "SEL<N>-<i>"形式で、<N>はコマンドシーケンス内で選択肢を識別するインデックス、
 * <i>は選択肢のインデックス
 */
const SELECT_NAME_PATTERN = /^SEL(\d+)-(\d+)$/;
/**
 * 最初の選択肢のインデックス
 *
 * "#SEL<N>-<最初の選択肢>"が選択肢の開始を表し、
 * 以降の"#SEL<N>-<i>"は選択肢の区切りを表す
 */
const FIRST_SELECT_CHOICE_INDEX = 0;
/**
 * 選択肢の開始トークン
 *
 * 入れ子の深さを数えるために用いる
 */
const selectInitiator = (selectIndex) => `#SEL${selectIndex}-${FIRST_SELECT_CHOICE_INDEX}`;
/**
 * 選択肢の終端トークン
 */
const selectTerminator = (selectIndex) => `#SELEND${selectIndex}`;
/**
 * 選択肢のコマンド名でない場合はundefinedを返す
 */
const parseSelectName = (name) => {
    const [, selectIndex, choiceIndex] = name.match(SELECT_NAME_PATTERN) ?? [];
    if (selectIndex === undefined || choiceIndex === undefined) {
        return;
    }
    return {
        selectIndex: Number(selectIndex),
        choiceIndex: Number(choiceIndex),
    };
};
export class RawCommand {
    #name;
    #body;
    constructor(name, body) {
        this.#name = name;
        this.#body = body.trim();
    }
    get name() {
        return this.#name;
    }
    get body() {
        return this.#body;
    }
    /**
     * 次のコマンドを1つ読み取る
     *
     * 選択肢の場合は対応する"#SELEND<N>"までを、
     * 入れ子になった選択肢を含めて1つのコマンドとして読み取る
     */
    static #parseCommand(parser, name) {
        const select = parseSelectName(name);
        const body = select === undefined
            ? parser.parseChunk(COMMAND_TERMINATOR)
            : parser.parseChunk(selectTerminator(select.selectIndex), selectInitiator(select.selectIndex));
        return new RawCommand(name, body);
    }
    static parseSequence(input) {
        const commands = [];
        const parser = new ChunkParser(input.trim());
        while (!parser.isEnded()) {
            commands.push(RawCommand.#parseCommand(parser, parser.parseName()));
        }
        return commands;
    }
    /**
     * 選択肢の本体を"#SEL<N>-<i>"の区切りごとのコマンドシーケンスに分割する
     *
     * 入れ子になった選択肢の中の区切りは同じ<N>であっても対象にしない
     */
    static #parseChoiceSequences(input, selectIndex) {
        const firstSequence = [];
        const sequences = new Map([
            [FIRST_SELECT_CHOICE_INDEX, firstSequence],
        ]);
        const parser = new ChunkParser(input.trim());
        let sequence = firstSequence;
        while (!parser.isEnded()) {
            const name = parser.parseName();
            const select = parseSelectName(name);
            // 同じ選択肢に属する区切りであれば次のコマンドシーケンスに移る
            // 最初の選択肢は開始を表すため、ここに現れる場合は入れ子の選択肢である
            if (select?.selectIndex === selectIndex &&
                select.choiceIndex !== FIRST_SELECT_CHOICE_INDEX) {
                sequence = sequences.get(select.choiceIndex) ?? [];
                sequences.set(select.choiceIndex, sequence);
                continue;
            }
            sequence.push(RawCommand.#parseCommand(parser, name));
        }
        return sequences;
    }
    toString() {
        let s = `#${this.#name}`;
        const select = parseSelectName(this.#name);
        if (select !== undefined) {
            s += ` ${this.#body}\n`;
            s += selectTerminator(select.selectIndex);
        }
        else {
            if (this.#body) {
                // Retain newlines around the body for formatting consistency
                s += `\n${this.#body}\n`;
            }
            else {
                s += "\n";
            }
            s += COMMAND_TERMINATOR;
        }
        return s;
    }
    parse() {
        const name = this.#name;
        const body = this.#body;
        const select = parseSelectName(name);
        let command;
        if (select !== undefined) {
            // 1行目がパラメータで、2行目以降が選択肢ごとのコマンド
            const [, paramsBody = body, commandsBody = ""] = body.match(/(.+?)\r?\n(.*)/s) ?? [];
            const params = parseCSP(paramsBody);
            const sequences = RawCommand.#parseChoiceSequences(commandsBody, select.selectIndex);
            const choices = [];
            for (const [choiceIndex, rawCommands] of [...sequences].sort(([a], [b]) => a - b)) {
                const label = params[`i${choiceIndex}`];
                // 表示名のない選択肢は存在しない
                if (label === undefined) {
                    continue;
                }
                choices.push({
                    label: unescapeMetaChars(label),
                    sequence: rawCommands.map((c) => c.parse()),
                });
            }
            const mode = params.x !== undefined && params.y !== undefined
                ? SelectMode.GUI
                : SelectMode.Random;
            const selectCommand = {
                type: CommandType.Select,
                mode,
                clearMessage: parseFlag(params.c),
                choices,
            };
            if (mode === SelectMode.GUI) {
                selectCommand.displayPosition = {
                    x: Number(params.x ?? 0),
                    y: Number(params.y ?? 0),
                };
            }
            command = selectCommand;
        }
        else {
            const params = parseCSP(body);
            const commandType = name;
            switch (commandType) {
                case CommandType.Message:
                    command = {
                        type: CommandType.Message,
                        content: unescapeMetaChars(params.m ?? ""),
                    };
                    break;
                case CommandType.Wait:
                    command = { type: CommandType.Wait, delay: Number(params.t ?? 0) };
                    break;
                default:
                    command = { type: commandType, params };
                    break;
            }
        }
        return command;
    }
}
export const CommandType = {
    Message: "MSG",
    Select: "SEL",
    ChangeMessageFont: "MSF",
    ShowGold: "SHOW_GLD",
    HideGold: "HIDE_GLD",
    Wait: "WAIT",
    StopScreenEffect: "EF_RGR",
    StartScreenEffect: "EF_GR",
    ChangeWeatherClear: "WT_SN",
    ChangeWeatherRain: "WT_RN",
    ChangeWeatherSnow: "WT_SW",
    ChangeObjectSprite: "CH_SP",
    ChangeHumanSprite: "CH_HM",
    ResetSpriteColorDefaultMaterials: "RC_DM",
    ResetSpriteColorDefaultHuman: "RC_DH",
    ResetSpriteColorSprite: "RC_SP",
    ResetSpriteColorAnimation: "RC_SA",
    ResetSpriteColorWallpaper: "RC_WP",
    ChangeSpriteColorDefaultMaterials: "SC_DM",
    ChangeSpriteColorDefaultHuman: "SC_DH",
    ChangeSpriteColorSprite: "SC_SP",
    ChangeSpriteColorAnimation: "SC_SA",
    ChangeSpriteColorWallpaper: "SC_WP",
    StopImage: "ST_IMG",
    PauseImage: "PS_IMG",
    ResumeImage: "RS_IMG",
    PauseLayer: "PS_LAY",
    ResumeLayer: "RS_LAY",
    DrawImage: "DW_IMG",
    DrawFollowImage: "DW_FL",
    StopAnimation: "ST_IMA",
    PauseAnimation: "PS_IMA",
    ResumeAnimation: "RS_IMA",
    PauseLayerAnimation: "PS_LLA",
    ResumeLayerAnimation: "RS_LLA",
    DrawAnimation: "DW_IMA",
    ChangeDistantView: "CH_DV",
    ChangeWallpaper: "CH_BG",
    ChangePartyDirection: "CH_PD",
    ChangeNpcDirection: "CH_ND",
    MovePartyDirection: "MV_PD",
    MovePartyAbsolute: "MV_PA",
    MovePartyRelative: "MV_PR",
    MoveNpcDirection: "MV_ND",
    MoveNpcAbsolute: "MV_NA",
    MoveNpcRelative: "MV_NR",
    ChangeNpcMovement: "CH_MT",
    MoveMap: "MV_MP",
    MoveCameraReset: "MV_CF",
    MoveCameraDirection: "MV_CD",
    MoveCameraAbsolute: "MV_CA",
    MoveCameraRelative: "MV_CR",
    ChangeBGM: "CH_YB",
    StopBGM: "ST_YB",
    PauseBGM: "PS_YB",
    ResumeBGM: "RS_YB",
    SeekBGM: "SK_YB",
    RateBGM: "RT_YB",
    PlaySound: "PL_SD",
    StopSound: "ST_SD",
    OnSwitch: "ON_SW",
    OffSwitch: "OFF_SW",
    PlusGold: "PL_GLD",
    MinusGold: "MI_GLD",
    MultiplyGold: "ML_GLD",
    SetGold: "SET_GLD",
    SaveData: "SV_DT",
    LoadData: "LD_DT",
    FinishEvent: "FIN_EV",
    RemoveEvent: "RM_EV",
    ChangePhase: "CH_PH",
    Comment: "CM_EV"
};
export const ScreenEffectColorType = {
    Color: "color",
    Gradient: "gradient",
};
export const SelectMode = {
    GUI: "gui",
    Random: "random",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUdyRTs7R0FFRztBQUNILE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBRWpDOzs7OztHQUtHO0FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUUvQzs7Ozs7R0FLRztBQUNILE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBRXBDOzs7O0dBSUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxDQUFDLFdBQW1CLEVBQVUsRUFBRSxDQUN0RCxPQUFPLFdBQVcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO0FBRXBEOztHQUVHO0FBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFdBQW1CLEVBQVUsRUFBRSxDQUN2RCxVQUFVLFdBQVcsRUFBRSxDQUFDO0FBTzFCOztHQUVHO0FBQ0gsTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFZLEVBQTBCLEVBQUU7SUFDL0QsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFM0UsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMzRCxPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU87UUFDTCxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNoQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUNqQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsTUFBTSxPQUFPLFVBQVU7SUFDWixLQUFLLENBQVM7SUFD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