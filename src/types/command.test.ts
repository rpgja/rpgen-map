import { describe, expect, test } from "bun:test";
import {
  type Command,
  CommandType,
  RawCommand,
  type SelectChoice,
  SelectMode,
} from "@/types/command.js";

const parseSequence = (input: string): Command[] =>
  RawCommand.parseSequence(input).map((c) => c.parse());

const expectSelect = (command: Command | undefined): SelectChoice[] => {
  expect(command?.type).toBe(CommandType.Select);

  if (command?.type !== CommandType.Select) {
    throw new Error("Not a select command.");
  }

  return command.choices;
};

describe("RawCommand.parseSequence()", () => {
  test("Commands are parsed in order", () => {
    const commands = parseSequence(`#MSG
m:こんにちは,
#ED
#WAIT
t:500,
#ED`);

    expect(commands).toStrictEqual([
      { type: CommandType.Message, content: "こんにちは" },
      { type: CommandType.Wait, delay: 500 },
    ]);
  });

  test("Select is parsed into ordered choices", () => {
    const [select] = parseSequence(`#SEL0-0 x:50,y:220,c:1,i0:はい,i1:いいえ,
#MSG
m:はいを押した,
#ED
#SEL0-1
#MSG
m:いいえを押した,
#ED
#SELEND0`);

    if (select?.type !== CommandType.Select) {
      throw new Error("Not a select command.");
    }

    expect(select.clearMessage).toBe(true);
    expect(select.mode).toBe(SelectMode.GUI);
    expect(select.displayPosition).toStrictEqual({ x: 50, y: 220 });
    expect(select.choices).toStrictEqual([
      {
        label: "はい",
        sequence: [{ type: CommandType.Message, content: "はいを押した" }],
      },
      {
        label: "いいえ",
        sequence: [{ type: CommandType.Message, content: "いいえを押した" }],
      },
    ]);
  });

  test("Select without x and y coordinates sets mode to SelectMode.Random and displayPosition to undefined", () => {
    const [select] = parseSequence(`#SEL1-0 c:0,i0:Battle☆,i1:Boss Battle☆,
#CH_YB
v:QElM1DgjrpA,
#ED
#SEL1-1
#CH_YB
v:nnyxOD5tR5Y,
#ED
#SELEND1`);

    if (select?.type !== CommandType.Select) {
      throw new Error("Not a select command.");
    }

    expect(select.mode).toBe(SelectMode.Random);
    expect(select.displayPosition).toBeUndefined();
    expect(select.choices).toHaveLength(2);
  });

  test("Choices with the same display name are kept separately", () => {
    const choices = expectSelect(
      parseSequence(`#SEL0-0 c:0,i0:2,i1:2,
#MSG
m:1つ目,
#ED
#SEL0-1
#MSG
m:2つ目,
#ED
#SELEND0`)[0],
    );

    expect(choices.map((c) => c.label)).toStrictEqual(["2", "2"]);
    expect(choices.map((c) => c.sequence)).toStrictEqual([
      [{ type: CommandType.Message, content: "1つ目" }],
      [{ type: CommandType.Message, content: "2つ目" }],
    ]);
  });

  test("Selects can be nested over multiple levels", () => {
    const choices = expectSelect(
      parseSequence(`#SEL0-0 c:0,i0:A,i1:B,
#SEL1-0 c:0,i0:AA,i1:AB,
#SEL2-0 c:0,i0:AAA,i1:AAB,
#MSG
m:深い,
#ED
#SEL2-1
#MSG
m:AAB,
#ED
#SELEND2
#SEL1-1
#MSG
m:AB,
#ED
#SELEND1
#SEL0-1
#MSG
m:B,
#ED
#SELEND0`)[0],
    );

    expect(choices.map((c) => c.label)).toStrictEqual(["A", "B"]);

    const nested = expectSelect(choices[0]?.sequence[0]);

    expect(nested.map((c) => c.label)).toStrictEqual(["AA", "AB"]);

    const deepest = expectSelect(nested[0]?.sequence[0]);

    expect(deepest.map((c) => c.label)).toStrictEqual(["AAA", "AAB"]);
    expect(deepest[0]?.sequence).toStrictEqual([
      { type: CommandType.Message, content: "深い" },
    ]);
  });

  test("Nested select reusing the same index is not mistaken for a separator", () => {
    const choices = expectSelect(
      parseSequence(`#SEL0-0 c:0,i0:外1,i1:外2,
#SEL0-0 c:0,i0:内1,i1:内2,
#MSG
m:内側,
#ED
#SEL0-1
#MSG
m:内側2,
#ED
#SELEND0
#SEL0-1
#MSG
m:外側2,
#ED
#SELEND0`)[0],
    );

    expect(choices.map((c) => c.label)).toStrictEqual(["外1", "外2"]);
    expect(choices[1]?.sequence).toStrictEqual([
      { type: CommandType.Message, content: "外側2" },
    ]);

    const nested = expectSelect(choices[0]?.sequence[0]);

    expect(nested.map((c) => c.label)).toStrictEqual(["内1", "内2"]);
  });

  test("Commands after a nested select belong to the enclosing choice", () => {
    const choices = expectSelect(
      parseSequence(`#SEL0-0 c:0,i0:A,i1:B,
#SEL1-0 c:0,i0:AA,i1:AB,
#SEL1-1
#SELEND1
#MSG
m:選択肢Aの続き,
#ED
#SEL0-1
#SELEND0`)[0],
    );

    expect(choices[0]?.sequence[1]).toStrictEqual({
      type: CommandType.Message,
      content: "選択肢Aの続き",
    });
  });

  test("Select index of 10 or more is not confused with a shorter one", () => {
    const choices = expectSelect(
      parseSequence(`#SEL1-0 c:0,i0:A,i1:B,
#SEL10-0 c:0,i0:AA,i1:AB,
#SEL10-1
#SELEND10
#SEL1-1
#MSG
m:B,
#ED
#SELEND1`)[0],
    );

    expect(choices.map((c) => c.label)).toStrictEqual(["A", "B"]);
    expect(
      expectSelect(choices[0]?.sequence[0]).map((c) => c.label),
    ).toStrictEqual(["AA", "AB"]);
  });
});

describe("RawCommand#toString()", () => {
  test("Nested selects are restored", () => {
    const input = `#SEL0-0 c:0,i0:A,i1:B,
#SEL1-0 c:0,i0:AA,i1:AB,
#MSG
m:AA,
#ED
#SEL1-1
#SELEND1
#SEL0-1
#SELEND0`;

    expect(
      RawCommand.parseSequence(input)
        .map((c) => c.toString())
        .join("\n"),
    ).toBe(input);
  });
});
