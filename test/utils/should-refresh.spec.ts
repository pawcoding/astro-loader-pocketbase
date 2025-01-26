import { assert, describe, test } from "vitest";
import { shouldRefresh } from "../../src/utils/should-refresh";

describe("shouldRefresh", () => {
  test("should return true if context is undefined", () => {
    const context = undefined;
    const collectionName = "testCollection";

    assert(shouldRefresh(context, collectionName));
  });

  test("should return true if context source is not 'astro-integration-pocketbase'", () => {
    const context = {
      source: "other-source",
      collection: "testCollection"
    };
    const collectionName = "testCollection";

    assert(shouldRefresh(context, collectionName));
  });

  test("should return true if context collection is missing", () => {
    const context = {
      source: "astro-integration-pocketbase"
    };
    const collectionName = "testCollection";

    assert(shouldRefresh(context, collectionName));
  });

  test("should return true if context collection is a string and matches collectionName", () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: "testCollection"
    };
    const collectionName = "testCollection";

    assert(shouldRefresh(context, collectionName));
  });

  test("should return false if context collection is a string and does not match collectionName", () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: "otherCollection"
    };
    const collectionName = "testCollection";

    assert(!shouldRefresh(context, collectionName));
  });

  test("should return true if context collection is an array and includes collectionName", () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: ["testCollection", "otherCollection"]
    };
    const collectionName = "testCollection";
    assert(shouldRefresh(context, collectionName));
  });

  test("should return false if context collection is an array and does not include collectionName", () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: ["otherCollection"]
    };
    const collectionName = "testCollection";

    assert(!shouldRefresh(context, collectionName));
  });

  test("should return true if context collection is an unexpected type", () => {
    const context = {
      source: "astro-integration-pocketbase",
      collection: 123
    };
    const collectionName = "testCollection";

    assert(shouldRefresh(context, collectionName));
  });
});
