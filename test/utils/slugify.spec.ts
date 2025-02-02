import { assert, describe, test } from "vitest";
import { slugify } from "../../src/utils/slugify";

describe("slugify", () => {
  test("should convert a simple string to a slug", () => {
    const input = "Hello World";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });

  test("should handle strings with special characters", () => {
    const input = "Hello, World!";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });

  test("should replace umlauts correctly", () => {
    const input = "äöüß";
    const expected = "aeoeuess";

    assert.equal(slugify(input), expected);
  });

  test("should handle multiple spaces", () => {
    const input = "Hello    World";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });

  test("should trim dashes from start and end", () => {
    const input = "-Hello World-";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });

  test("should replace multiple dashes with a single dash", () => {
    const input = "Hello---World";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });

  test("should handle empty strings", () => {
    const input = "";
    const expected = "";

    assert.equal(slugify(input), expected);
  });

  test("should handle strings with only special characters", () => {
    const input = "!@#$%^&*()";
    const expected = "";

    assert.equal(slugify(input), expected);
  });

  test("should handle strings with numbers", () => {
    const input = "Hello World 123";
    const expected = "hello-world-123";

    assert.equal(slugify(input), expected);
  });

  test("should handle strings with mixed case", () => {
    const input = "HeLLo WoRLd";
    const expected = "hello-world";

    assert.equal(slugify(input), expected);
  });
});
