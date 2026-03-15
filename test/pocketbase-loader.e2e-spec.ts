import { randomUUID } from "crypto";
import type { LoaderContext, ParseDataOptions } from "astro/loaders";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  test
} from "vitest";
import { pocketbaseLoader } from "../src/pocketbase-loader";
import type { PocketBaseEntry } from "../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../src/types/pocketbase-loader-options.type";
import { createLoaderContext } from "./_mocks/create-loader-context";
import { createLoaderOptions } from "./_mocks/create-loader-options";
import { deleteCollection } from "./_mocks/delete-collection";
import { insertCollection } from "./_mocks/insert-collection";
import { insertEntry } from "./_mocks/insert-entry";
import { fields, rawEntry } from "./_mocks/test-fields";

describe("pocketbaseLoader", () => {
  const superuserToken = inject("superuserToken");
  let collectionName: string;
  let testOptions: PocketBaseLoaderOptions;

  beforeEach(() => {
    collectionName = randomUUID().replaceAll("-", "");
    testOptions = createLoaderOptions({ collectionName });
  });

  it("should return a valid loader", () => {
    const loader = pocketbaseLoader(testOptions);

    expect(loader).toBeDefined();
    expect(loader.name).toBe("pocketbase-loader");
    expect(typeof loader.load).toBe("function");
    expect(typeof loader.createSchema).toBe("function");
  });

  describe("load function", () => {
    let context: LoaderContext;
    let entry: PocketBaseEntry;

    beforeEach(async () => {
      await insertCollection(
        [
          { name: "title", type: "text" },
          { name: "content", type: "text" }
        ],
        testOptions,
        superuserToken
      );

      entry = await insertEntry(
        { title: "Test Title", content: "Test Content" },
        testOptions,
        superuserToken
      );

      context = createLoaderContext();
    });

    afterEach(async () => {
      await deleteCollection(testOptions, superuserToken);
    });

    test("should load entries without errors", async () => {
      const loader = pocketbaseLoader(testOptions);

      await loader.load(context);

      const values = context.store.values();
      expect(values).toHaveLength(1);
      expect(values.at(0)?.id).toBe(entry.id);
    });

    test("should work with experimental liveTypesOnly mode", async () => {
      const liveTypesOptions = {
        ...testOptions,
        experimental: { liveTypesOnly: true }
      };

      const loader = pocketbaseLoader(liveTypesOptions);

      await loader.load(context);

      const values = context.store.values();
      expect(values).toHaveLength(0);
    });
  });

  describe("createSchema function", () => {
    beforeEach(async () => {
      await insertCollection(fields, testOptions, superuserToken);
    });

    afterEach(async () => {
      await deleteCollection(testOptions, superuserToken);
    });

    test("should return valid schema for all field types", async () => {
      const loader = pocketbaseLoader(testOptions);

      const { schema, types } = await loader.createSchema();

      for (const field of fields) {
        const jsonSchema = schema.toJSONSchema({ unrepresentable: "any" });
        expect(jsonSchema.properties).toHaveProperty(field.name);
      }

      expect(types).toMatchSnapshot();
    });

    test("should parse entry with generated schema", async () => {
      const entry = await insertEntry(rawEntry, testOptions, superuserToken);
      // @ts-expect-error - autodate_field is unknown
      entry.autodate_field = new Date(entry.autodate_field);
      // @ts-expect-error - date_field is unknown
      entry.date_field = new Date(entry.date_field);

      const loader = pocketbaseLoader(testOptions);
      const { schema } = await loader.createSchema();

      expect(() => schema.parse(entry)).not.toThrow();

      const result = schema.parse(entry) as PocketBaseEntry;
      expect(result).toMatchObject(entry);
    });
  });

  test("should load and parse entries", async () => {
    await insertCollection(fields, testOptions, superuserToken);

    const entry = await insertEntry(rawEntry, testOptions, superuserToken);
    // @ts-expect-error - autodate_field is unknown
    entry.autodate_field = new Date(entry.autodate_field);
    // @ts-expect-error - date_field is unknown
    entry.date_field = new Date(entry.date_field);

    const loader = pocketbaseLoader(testOptions);
    const { schema } = await loader.createSchema();

    const context = createLoaderContext({
      // @ts-expect-error - the type of props.data is unknown, but we know it should be PocketBaseEntry
      parseData: async (props: ParseDataOptions<PocketBaseEntry>) =>
        schema.parse(props.data)
    });

    await loader.load(context);

    const values = context.store.values();
    expect(values).toHaveLength(1);
    expect(values[0].data).toMatchObject(entry);

    await deleteCollection(testOptions, superuserToken);
  });
});
