import type { PercentPosition, Position } from "@/types/types.js";
import { unescapeMetaChars } from "@/utils.js";
import { ChunkParser, parseCSP, parseFlag } from "@/utils/parser.js";
import type { RgbaColor } from "./color.js";

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
const selectInitiator = (selectIndex: number): string =>
  `#SEL${selectIndex}-${FIRST_SELECT_CHOICE_INDEX}`;

/**
 * 選択肢の終端トークン
 */
const selectTerminator = (selectIndex: number): string =>
  `#SELEND${selectIndex}`;

type SelectName = {
  selectIndex: number;
  choiceIndex: number;
};

/**
 * 選択肢のコマンド名でない場合はundefinedを返す
 */
const parseSelectName = (name: string): SelectName | undefined => {
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
  readonly #name: string;
  readonly #body: string;

  constructor(name: string, body: string) {
    this.#name = name;
    this.#body = body.trim();
  }

  get name(): string {
    return this.#name;
  }

  get body(): string {
    return this.#body;
  }

  /**
   * 次のコマンドを1つ読み取る
   *
   * 選択肢の場合は対応する"#SELEND<N>"までを、
   * 入れ子になった選択肢を含めて1つのコマンドとして読み取る
   */
  static #parseCommand(parser: ChunkParser, name: string): RawCommand {
    const select = parseSelectName(name);
    const body =
      select === undefined
        ? parser.parseChunk(COMMAND_TERMINATOR)
        : parser.parseChunk(
            selectTerminator(select.selectIndex),
            selectInitiator(select.selectIndex),
          );

    return new RawCommand(name, body);
  }

  static parseSequence(input: string): RawCommand[] {
    const commands: RawCommand[] = [];
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
  static #parseChoiceSequences(
    input: string,
    selectIndex: number,
  ): Map<number, RawCommand[]> {
    const firstSequence: RawCommand[] = [];
    const sequences = new Map<number, RawCommand[]>([
      [FIRST_SELECT_CHOICE_INDEX, firstSequence],
    ]);
    const parser = new ChunkParser(input.trim());
    let sequence = firstSequence;

    while (!parser.isEnded()) {
      const name = parser.parseName();
      const select = parseSelectName(name);

      // 同じ選択肢に属する区切りであれば次のコマンドシーケンスに移る
      // 最初の選択肢は開始を表すため、ここに現れる場合は入れ子の選択肢である
      if (
        select?.selectIndex === selectIndex &&
        select.choiceIndex !== FIRST_SELECT_CHOICE_INDEX
      ) {
        sequence = sequences.get(select.choiceIndex) ?? [];
        sequences.set(select.choiceIndex, sequence);

        continue;
      }

      sequence.push(RawCommand.#parseCommand(parser, name));
    }

    return sequences;
  }

  toString(): string {
    let s = `#${this.#name}`;
    const select = parseSelectName(this.#name);

    if (select !== undefined) {
      s += ` ${this.#body}\n`;
      s += selectTerminator(select.selectIndex);
    } else {
      if (this.#body) {
        // Retain newlines around the body for formatting consistency
        s += `\n${this.#body}\n`;
      } else {
        s += "\n";
      }
      s += COMMAND_TERMINATOR;
    }

    return s;
  }

  parse(): Command {
    const name = this.#name;
    const body = this.#body;
    const select = parseSelectName(name);
    let command: Command;

    if (select !== undefined) {
      // 1行目がパラメータで、2行目以降が選択肢ごとのコマンド
      const [, paramsBody = body, commandsBody = ""] =
        body.match(/(.+?)\r?\n(.*)/s) ?? [];
      const params = parseCSP(paramsBody);
      const sequences = RawCommand.#parseChoiceSequences(
        commandsBody,
        select.selectIndex,
      );
      const choices: SelectChoice[] = [];

      for (const [choiceIndex, rawCommands] of [...sequences].sort(
        ([a], [b]) => a - b,
      )) {
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

      const mode =
        params.x !== undefined && params.y !== undefined
          ? SelectMode.GUI
          : SelectMode.Random;

      const selectCommand: CommandMap[typeof CommandType.Select] = {
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
    } else {
      const params = parseCSP(body);

      const commandType = name as keyof CommandParamsMap;

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

export const SelectMode = {
  GUI: "gui",
  Random: "random",
} as const;

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
  [K in CommandType]: K extends typeof CommandType.Message
    ? { content: string }
    : K extends typeof CommandType.Wait
      ? { delay: number }
      : K extends typeof CommandType.Select
        ? {
            mode: SelectMode;
            displayPosition?: Position;
            clearMessage: boolean;
            choices: SelectChoice[];
          }
        : { params: Record<string, string> };
};

export interface CommandSequence extends Array<Command> {}

export type CommandMap = {
  [K in keyof CommandParamsMap]: CommandParamsMap[K] & { type: K };
};

export type Command = CommandMap[keyof CommandMap];
