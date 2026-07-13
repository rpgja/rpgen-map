import type { PercentPosition, Position } from "@/types/types.js";
import { unescapeMetaChars } from "@/utils.js";
import { ChunkParser, parseCSP } from "@/utils/parser.js";
import type { RgbaColor } from "./color.js";

export class RawCommand {
  readonly #name: string;
  readonly #body: string;

  constructor(name: string, body: string) {
    this.#name = name;
    this.#body = body.trim();
  }

  static parseSequence(input: string): RawCommand[] {
    const commands: RawCommand[] = [];
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

  toString(): string {
    let s = `#${this.#name}`;

    if (this.#name.startsWith("SEL")) {
      s += ` ${this.#body}\n`;
      s += `#SELEND${this.#name.match(/^SEL(\d+)/)?.[1]}`;
    } else {
      if (this.#body) {
        // Retain newlines around the body for formatting consistency
        s += `\n${this.#body}\n`;
      } else {
        s += "\n";
      }
      s += "#ED";
    }

    return s;
  }

  parse(): Command {
    const name = this.#name;
    const body = this.#body;
    let command: Command;

    if (name.startsWith("SEL")) {
      const [, paramsBody = "", commandsBody = ""] =
        body.match(/(.+?)\r?\n(.*)/s) ?? [];
      const params = parseCSP(paramsBody);
      const selN = name.match(/^SEL(\d+)/)?.[1];

      const choices = new Map<string, Command[]>();
      
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
    } else {
      const params = parseCSP(body);

      const commandType = name as keyof CommandParamsMap;

      switch (commandType) {
        case CommandType.Message:
          command = { type: CommandType.Message, content: unescapeMetaChars(params.m ?? "") };
          break;
        case CommandType.Wait:
          command = { type: CommandType.Wait, delay: Number(params.t ?? 0) };
          break;
        default:
          command = { type: commandType, params } as Command;
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
} as const;

export type CommandType = typeof CommandType[keyof typeof CommandType];

export type EmptyCommandParams = Record<never, never>;

export const ScreenEffectColorType = {
  Color: "color",
  Gradient: "gradient",
} as const;

export type ScreenEffectColorType =
  typeof ScreenEffectColorType[keyof typeof ScreenEffectColorType];

export type ScreenEffectColor =
  | { type: typeof ScreenEffectColorType.Color; color: RgbaColor }
  | { type: typeof ScreenEffectColorType.Gradient; aPosition: PercentPosition; bPosition: PercentPosition; aColor: RgbaColor; bColor: RgbaColor; stopPosition: number };

export type CommandParamsMap = {
  [K in CommandType]: K extends typeof CommandType.Message
    ? { content: string }
    : K extends typeof CommandType.Wait
    ? { delay: number }
    : K extends typeof CommandType.Select
    ? { displayPosition?: Position; clearMessage: boolean; choices: Map<string, CommandSequence> }
    : { params: Record<string, string> };
};

export interface CommandSequence extends Array<Command> {}

export type CommandMap = {
  [K in keyof CommandParamsMap]: CommandParamsMap[K] & { type: K };
};

export type Command = CommandMap[keyof CommandMap];
