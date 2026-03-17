import { randomUUID } from "crypto";
import type { LoaderContext, ParseDataOptions } from "astro/loaders";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  test
} from "vitest";
import { transformFileUrl } from "../src";
import { pocketbaseLoader } from "../src/pocketbase-loader";
import type { PocketBaseEntry } from "../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../src/types/pocketbase-loader-options.type";
import { createLoaderContext } from "./_mocks/create-loader-context";
import { createLoaderOptions } from "./_mocks/create-loader-options";
import { deleteCollection } from "./_mocks/delete-collection";
import { insertCollection } from "./_mocks/insert-collection";
import { insertEntry } from "./_mocks/insert-entry";
import { fields, rawEntry } from "./_mocks/test-fields";
import { uploadFile } from "./_mocks/upload-file";

describe("pocketbaseLoader", () => {
  const superuserToken = inject("superuserToken");
  let collectionName: string;
  let testOptions: PocketBaseLoaderOptions;
  let context: LoaderContext;
  let originalEntry: PocketBaseEntry;
  let testEntry: PocketBaseEntry;

  beforeAll(async () => {
    collectionName = randomUUID().replaceAll("-", "");
    testOptions = createLoaderOptions({ collectionName });

    await insertCollection(fields, testOptions, superuserToken);

    const partialEntry = await insertEntry(
      rawEntry,
      testOptions,
      superuserToken
    );
    originalEntry = await uploadFile(
      partialEntry.id,
      testOptions,
      superuserToken
    );
  });

  beforeEach(() => {
    context = createLoaderContext();

    testEntry = structuredClone(originalEntry);
  });

  afterAll(async () => {
    await deleteCollection(testOptions, superuserToken);
  });

  it("should return a valid loader", () => {
    const loader = pocketbaseLoader(testOptions);

    expect(loader).toBeDefined();
    expect(loader.name).toBe("pocketbase-loader");
    expect(typeof loader.load).toBe("function");
    expect(typeof loader.createSchema).toBe("function");
  });

  describe("load function", () => {
    test("should load entries without errors", async () => {
      const loader = pocketbaseLoader(testOptions);

      await loader.load(context);

      const values = context.store.values();
      expect(values).toHaveLength(1);
      expect(values.at(0)?.id).toBe(originalEntry.id);
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
    test("should return valid schema for all field types", async () => {
      const loader = pocketbaseLoader(testOptions);

      const { schema, types } = await loader.createSchema();

      const actualSchema = schema.type === "pipe" ? schema.in : schema;
      expect(Object.keys(actualSchema.shape)).toEqual(
        expect.arrayContaining(fields.map((field) => field.name))
      );

      expect(types).toMatchSnapshot();
    });

    test("should parse entry with generated schema", async () => {
      const expected = structuredClone(testEntry);
      // @ts-expect-error - autodate_field is unknown
      expected.autodate_field = new Date(expected.autodate_field);
      // @ts-expect-error - date_field is unknown
      expected.date_field = new Date(expected.date_field);
      expected.file_field = [
        transformFileUrl(
          testOptions.url,
          testOptions.collectionName,
          expected.id,
          // @ts-expect-error - file_field is unknown
          expected.file_field
        )
      ];

      const loader = pocketbaseLoader(testOptions);
      const { schema } = await loader.createSchema();

      expect(() => schema.parse(structuredClone(testEntry))).not.toThrow();

      const result = schema.parse(
        structuredClone(testEntry)
      ) as PocketBaseEntry;
      expect(result).toMatchObject(expected);
    });
  });

  test("should load and parse entries", async () => {
    // @ts-expect-error - autodate_field is unknown
    testEntry.autodate_field = new Date(testEntry.autodate_field);
    // @ts-expect-error - date_field is unknown
    testEntry.date_field = new Date(testEntry.date_field);
    testEntry.file_field = [
      transformFileUrl(
        testOptions.url,
        testOptions.collectionName,
        testEntry.id,
        // @ts-expect-error - file_field is unknown
        testEntry.file_field
      )
    ];

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
    expect(values[0].data).toMatchObject(testEntry);
  });
});
