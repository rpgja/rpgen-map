import type { PercentPosition, Position } from "../types/types.js";
import type { RgbaColor } from "./color.js";
export declare class RawCommand {
    #private;
    constructor(name: string, body: string);
    get name(): string;
    get body(): string;
    static parseSequence(input: string): RawCommand[];
    toString(): string;
    parse(): Command;
}
export declare const CommandType: {
    readonly Message: "MSG";
    readonly Select: "SEL";
    readonly ChangeMessageFont: "MSF";
    readonly ShowGold: "SHOW_GLD";
    readonly HideGold: "HIDE_GLD";
    readonly Wait: "WAIT";
    readonly StopScreenEffect: "EF_RGR";
    readonly StartScreenEffect: "EF_GR";
    readonly ChangeWeatherClear: "WT_SN";
    readonly ChangeWeatherRain: "WT_RN";
    readonly ChangeWeatherSnow: "WT_SW";
    readonly ChangeObjectSprite: "CH_SP";
    readonly ChangeHumanSprite: "CH_HM";
    readonly ResetSpriteColorDefaultMaterials: "RC_DM";
    readonly ResetSpriteColorDefaultHuman: "RC_DH";
    readonly ResetSpriteColorSprite: "RC_SP";
    readonly ResetSpriteColorAnimation: "RC_SA";
    readonly ResetSpriteColorWallpaper: "RC_WP";
    readonly ChangeSpriteColorDefaultMaterials: "SC_DM";
    readonly ChangeSpriteColorDefaultHuman: "SC_DH";
    readonly ChangeSpriteColorSprite: "SC_SP";
    readonly ChangeSpriteColorAnimation: "SC_SA";
    readonly ChangeSpriteColorWallpaper: "SC_WP";
    readonly StopImage: "ST_IMG";
    readonly PauseImage: "PS_IMG";
    readonly ResumeImage: "RS_IMG";
    readonly PauseLayer: "PS_LAY";
    readonly ResumeLayer: "RS_LAY";
    readonly DrawImage: "DW_IMG";
    readonly DrawFollowImage: "DW_FL";
    readonly StopAnimation: "ST_IMA";
    readonly PauseAnimation: "PS_IMA";
    readonly ResumeAnimation: "RS_IMA";
    readonly PauseLayerAnimation: "PS_LLA";
    readonly ResumeLayerAnimation: "RS_LLA";
    readonly DrawAnimation: "DW_IMA";
    readonly ChangeDistantView: "CH_DV";
    readonly ChangeWallpaper: "CH_BG";
    readonly ChangePartyDirection: "CH_PD";
    readonly ChangeNpcDirection: "CH_ND";
    readonly MovePartyDirection: "MV_PD";
    readonly MovePartyAbsolute: "MV_PA";
    readonly MovePartyRelative: "MV_PR";
    readonly MoveNpcDirection: "MV_ND";
    readonly MoveNpcAbsolute: "MV_NA";
    readonly MoveNpcRelative: "MV_NR";
    readonly ChangeNpcMovement: "CH_MT";
    readonly MoveMap: "MV_MP";
    readonly MoveCameraReset: "MV_CF";
    readonly MoveCameraDirection: "MV_CD";
    readonly MoveCameraAbsolute: "MV_CA";
    readonly MoveCameraRelative: "MV_CR";
    readonly ChangeBGM: "CH_YB";
    readonly StopBGM: "ST_YB";
    readonly PauseBGM: "PS_YB";
    readonly ResumeBGM: "RS_YB";
    readonly SeekBGM: "SK_YB";
    readonly RateBGM: "RT_YB";
    readonly PlaySound: "PL_SD";
    readonly StopSound: "ST_SD";
    readonly OnSwitch: "ON_SW";
    readonly OffSwitch: "OFF_SW";
    readonly PlusGold: "PL_GLD";
    readonly MinusGold: "MI_GLD";
    readonly MultiplyGold: "ML_GLD";
    readonly SetGold: "SET_GLD";
    readonly SaveData: "SV_DT";
    readonly LoadData: "LD_DT";
    readonly FinishEvent: "FIN_EV";
    readonly RemoveEvent: "RM_EV";
    readonly ChangePhase: "CH_PH";
    readonly Comment: "CM_EV";
};
export type CommandType = typeof CommandType[keyof typeof CommandType];
export type EmptyCommandParams = Record<never, never>;
export declare const ScreenEffectColorType: {
    readonly Color: "color";
    readonly Gradient: "gradient";
};
export type ScreenEffectColorType = typeof ScreenEffectColorType[keyof typeof ScreenEffectColorType];
export type ScreenEffectColor = {
    type: typeof ScreenEffectColorType.Color;
    color: RgbaColor;
} | {
    type: typeof ScreenEffectColorType.Gradient;
    aPosition: PercentPosition;
    bPosition: PercentPosition;
    aColor: RgbaColor;
    bColor: RgbaColor;
    stopPosition: number;
};
export declare const SelectMode: {
    readonly GUI: "gui";
    readonly Random: "random";
};
export type SelectMode = (typeof SelectMode)[keyof typeof SelectMode];
/**
 * 選択肢の分岐
 *
 * 表示名は重複しうるため、配列で順序どおりに保持する
 */
export type SelectChoice = {
    label: string;
    sequence: CommandSequence;
};
export type CommandParamsMap = {
    [K in CommandType]: K extends typeof CommandType.Message ? {
        content: string;
    } : K extends typeof CommandType.Wait ? {
        delay: number;
    } : K extends typeof CommandType.Select ? {
        mode: SelectMode;
        displayPosition?: Position;
        clearMessage: boolean;
        choices: SelectChoice[];
    } : {
        params: Record<string, string>;
    };
};
export interface CommandSequence extends Array<Command> {
}
export type CommandMap = {
    [K in keyof CommandParamsMap]: CommandParamsMap[K] & {
        type: K;
    };
};
export type Command = CommandMap[keyof CommandMap];
//# sourceMappingURL=command.d.ts.map