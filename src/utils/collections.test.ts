import { describe, expect, test } from "bun:test";
import { LargeMap } from "@/utils/collections.js";

describe("class LargeMap", () => {
  const createLargeMap = (): LargeMap<string, string> => {
    const map = new LargeMap<string, string>(1); // Map size limited to 1

    map.set("name", "Taro");
    map.set("country", "Japan"); // map changed

    return map;
  };

  test("set() / get()", () => {
    const map = createLargeMap();

    expect(map.get("name")).toBe("Taro");
    expect(map.get("country")).toBe("Japan");
    expect(new LargeMap().get("age")).toBe(undefined);
  });

  test("forEach()", () => {
    const map = createLargeMap();
    let count = 0;

    // biome-ignore lint/complexity/noForEach: test forEach method
    map.forEach(() => count++);

    expect(count).toBe(2);
  });

  test("clear()", () => {
    const map = createLargeMap();

    expect(map.size).toBe(2);

    map.clear();

    expect(map.size).toBe(0);
  });

  test("size", () => {
    const map = new LargeMap(1); // Map size limited to 1

    map.set("name", "Taro");
    map.set("country", "Japan"); // map changed

    expect(map.size).toBe(2);
    expect(new LargeMap().size).toBe(0);
  });

  test("delete()", () => {
    const map = createLargeMap();

    expect(map.delete("country")).toBe(true); // delete next map value
    expect(map.delete("name")).toBe(true);
    expect<string | undefined>(map.get("name")).toBe(undefined);
    expect(new LargeMap().delete("age")).toBe(false);
  });

  test("keys()", () => {
    const map = createLargeMap();

    expect([...map.keys()]).toStrictEqual(["name", "country"]);
  });

  test("values()", () => {
    const map = createLargeMap();

    expect([...map.values()]).toStrictEqual(["Taro", "Japan"]);
  });

  test("has()", () => {
    const map = createLargeMap();

    expect(map.has("name")).toBe(true);
    expect(new LargeMap().has("age")).toBe(false);
  });

  test("@@iterator()", () => {
    const map = createLargeMap();

    expect([...map]).toStrictEqual([
      ["name", "Taro"],
      ["country", "Japan"],
    ]);
    expect([...new LargeMap()]).toStrictEqual([]);
  });

  test("@@toStringTag", () => {
    expect(new LargeMap()[Symbol.toStringTag]).toBe("Map");
  });
});
