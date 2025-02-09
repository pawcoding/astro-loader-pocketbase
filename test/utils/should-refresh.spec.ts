import { describe, expect, test } from "vitest";
import { shouldRefresh } from "../../src/utils/should-refresh";

describe("shouldRefresh", () => {
  test('should return "refresh" if context is undefined', () => {
    const context = undefined;
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test("should return \"refresh\" if context source is not 'astro-integration-pocketbase'", () => {
    const context = {
      source: "other-source",
      collection: "testCollection"
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test('should return "refresh" if context collection is missing', () => {
    const context = {
      source: "astro-integration-pocketbase"
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test('should return "refresh" if context collection is a string and matches collectionName', () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: "testCollection"
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test('should return "skip" if context collection is a string and does not match collectionName', () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: "otherCollection"
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("skip");
  });

  test('should return "refresh" if context collection is an array and includes collectionName', () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: ["testCollection", "otherCollection"]
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test('should return "skip" if context collection is an array and does not include collectionName', () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: ["otherCollection"]
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("skip");
  });

  test('should return "refresh" if context collection is an unexpected type', () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: 123
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });

  test('should return "force" if context force is true', () => {
    const context = {
      source: "astro-integration-pocketbase",
      force: true
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("force");
  });

  test('should return "refresh" if context force is false', () => {
    const context = {
      source: "astro-integration-pocketbase",
      force: false
    };
    const collectionName = "testCollection";

    expect(shouldRefresh(context, collectionName)).toBe("refresh");
  });
});
