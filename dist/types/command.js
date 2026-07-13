import { unescapeMetaChars } from "../utils.js";
import { ChunkParser, parseCSP } from "../utils/parser.js";
export class RawCommand {
    #name;
    #body;
    constructor(name, body) {
        this.#name = name;
        this.#body = body.trim();
    }
    static parseSequence(input) {
        const commands = [];
        const parser = new ChunkParser(input.trim());
        while (!parser.isEnded()) {
            const name = parser.parseName();
            const end = name.startsWith("SEL")
                ? `#SELEND${name.match(/^SEL(\d+)/)?.[1]}`
                : "#ED";
            const value = parser.parseChunk(end);
            commands.push(new RawCommand(name, value));
        }
        return commands;
    }
    toString() {
        let s = `#${this.#name}`;
        if (this.#name.startsWith("SEL")) {
            s += ` ${this.#body}\n`;
            s += `#SELEND${this.#name.match(/^SEL(\d+)/)?.[1]}`;
        }
        else {
            if (this.#body) {
                // Retain newlines around the body for formatting consistency
                s += `\n${this.#body}\n`;
            }
            else {
                s += "\n";
            }
            s += "#ED";
        }
        return s;
    }
    parse() {
        const name = this.#name;
        const body = this.#body;
        let command;
        if (name.startsWith("SEL")) {
            const [, paramsBody = "", commandsBody = ""] = body.match(/(.+?)\r?\n(.*)/s) ?? [];
            const params = parseCSP(paramsBody);
            const selN = name.match(/^SEL(\d+)/)?.[1];
            const choices = new Map();
            const regex = new RegExp(`^#SEL${selN}-\\d+[ \\t]*\\r?\\n?`, "gm");
            const parts = commandsBody.split(regex);
            parts.forEach((partStr, index) => {
                const choiceName = params[`i${index}`];
                if (choiceName !== undefined) {
                    const rawCommands = RawCommand.parseSequence(partStr);
                    const parsedCommands = rawCommands.map((c) => c.parse());
                    choices.set(choiceName, parsedCommands);
                }
            });
            command = {
                type: CommandType.Select,
                clearMessage: params.c === "1",
                choices,
            };
        }
        else {
            const params = parseCSP(body);
            const commandType = name;
            switch (commandType) {
                case CommandType.Message:
                    command = { type: CommandType.Message, content: unescapeMetaChars(params.m ?? "") };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzFELE1BQU0sT0FBTyxVQUFVO0lBQ1osS0FBSyxDQUFTO0lBQ2QsS0FBSyxDQUFTO0lBRXZCLFlBQVksSUFBWSxFQUFFLElBQVk7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBYTtRQUNoQyxNQUFNLFFBQVEsR0FBaUIsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztZQUN6QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNWLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFckMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQs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