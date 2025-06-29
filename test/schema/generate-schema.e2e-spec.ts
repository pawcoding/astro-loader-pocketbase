import type { LoaderContext } from "astro/loaders";
import type { ZodObject, ZodSchema } from "astro/zod";
import { randomUUID } from "crypto";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import { generateSchema } from "../../src/schema/generate-schema";
import { transformFileUrl } from "../../src/schema/transform-files";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";

describe("generateSchema", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let context: LoaderContext;
  let superuserToken: string;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    context = createLoaderContext();

    const token = await getSuperuserToken(
      options.url,
      options.superuserCredentials!
    );

    assert(token, "Superuser token is not available.");
    superuserToken = token;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("load and parse schema", () => {
    it("should return basic schema if no schema is available", async () => {
      const result = (await generateSchema({
        ...options,
        superuserCredentials: undefined,
        localSchema: undefined
      })) as ZodObject<Record<string, ZodSchema<unknown>>>;

      expect(result.shape).toHaveProperty("id");
      expect(result.shape).toHaveProperty("collectionId");
      expect(result.shape).toHaveProperty("collectionName");
    });

    it("should return schema from remote if superuser credentials are provided", async () => {
      const result = (await generateSchema(options)) as ZodObject<
        Record<string, ZodSchema<unknown>>
      >;

      expect(Object.keys(result.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "password",
        "tokenKey",
        "email",
        "emailVisibility",
        "verified",
        "created",
        "updated",
        "expand"
      ]);
    });

    it("should return schema from local file if path is provided", async () => {
      const result = (await generateSchema({
        ...options,
        superuserCredentials: undefined,
        localSchema: "test/_mocks/superuser_schema.json"
      })) as ZodObject<Record<string, ZodSchema<unknown>>>;

      expect(Object.keys(result.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "emailVisibility",
        "verified",
        "created",
        "updated",
        "expand"
      ]);
    });
  });

  describe("custom id field", () => {
    it("should not log error if id field is present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        idField: "email"
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log error if id field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        idField: "nonexistent"
      });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log error if id field is not of a valid type", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        idField: "verified"
      });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });
  });

  describe("content fields", () => {
    it("should not log error if content field is present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        contentFields: "email"
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log error if content field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        contentFields: "nonexistent"
      });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log error if one content field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        contentFields: ["email", "nonexistent"]
      });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });
  });

  describe("updated field", () => {
    it("should log error if updated field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema({
        ...options,
        updatedField: "nonexistent"
      });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log warning if updated field is not of type autodate", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      await generateSchema({
        ...options,
        updatedField: "email"
      });

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it("should log warning if updated field does not have onUpdate set", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      await generateSchema({
        ...options,
        updatedField: "created"
      });

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });
  });

  it("should return entry with transformed file fields", async () => {
    const testOptions = { ...options, collectionName: "users" };
    const schema = await generateSchema(testOptions);

    const entry = {
      id: "123",
      collectionId: "456",
      collectionName: "users",
      password: "password",
      tokenKey: "tokenKey",
      email: "test@pawcode.de",
      created: new Date("2001-12-06"),
      updated: new Date(),
      avatar: "file.jpg"
    };

    expect(schema.parse(entry)).toEqual({
      ...entry,
      avatar: transformFileUrl(
        testOptions.url,
        testOptions.collectionName,
        entry.id,
        entry.avatar
      )
    });
  });

  describe("expand field", async () => {
    it("the related fields schema is provided for expanded fields", async () => {
      const RELATION_FIELD_NAME = "related";

      const redCollectionOptions = {
        ...options,
        collectionName: `red_${randomUUID().replace(/-/g, "")}`
      };

      const blueCollectionOptions = {
        ...options,
        collectionName: `blue_${randomUUID().replace(/-/g, "")}`
      };

      const blueCollection = await insertCollection(
        [
          {
            name: "name",
            type: "text"
          }
        ],
        blueCollectionOptions,
        superuserToken
      );

      await insertCollection(
        [
          {
            name: RELATION_FIELD_NAME,
            type: "relation",
            collectionId: blueCollection.id
          }
        ],
        redCollectionOptions,
        superuserToken
      );

      try {
        const testOptions = {
          ...options,
          collectionName: redCollectionOptions.collectionName,
          expand: [RELATION_FIELD_NAME]
        };
        const schema = (await generateSchema(testOptions)) as ZodObject<
          Record<string, ZodSchema<unknown>>
        >;

        const expandSchema = schema.shape.expand;
        const validExpand = {
          related: {
            collectionId: blueCollection.id,
            collectionName: blueCollection.name,
            id: "test",
            name: "Blue Entry"
          }
        };

        expect(() => expandSchema.parse(validExpand)).not.toThrow();

        const validArrayExpand = {
          related: [
            {
              collectionId: blueCollection.id,
              collectionName: blueCollection.name,
              id: "test",
              name: "Blue Entry"
            },
            {
              collectionId: blueCollection.id,
              collectionName: blueCollection.name,
              id: "test",
              name: "Blue Entry"
            }
          ]
        };

        expect(() => expandSchema.parse(validArrayExpand)).not.toThrow();
      } catch (error) {
        console.log(error);
      }

      await deleteCollection(redCollectionOptions, superuserToken);
      await deleteCollection(blueCollectionOptions, superuserToken);
    });
  });
});
