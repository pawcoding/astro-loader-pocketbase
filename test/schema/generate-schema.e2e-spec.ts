import type { ZodObject, ZodSchema } from "astro/zod";
import { afterEach, assert, beforeAll, describe, expect, it, vi } from "vitest";
import { generateSchema } from "../../src/schema/generate-schema";
import { transformFileUrl } from "../../src/schema/transform-files";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderOptions } from "../_mocks/create-loader-options";

describe("generateSchema", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let token: string;

  beforeAll(async () => {
    await checkE2eConnection();

    assert(options.superuserCredentials, "Superuser credentials are not set.");
    assert(
      !("impersonateToken" in options.superuserCredentials),
      "Impersonate token should not be used in tests."
    );

    const superuserToken = await getSuperuserToken(
      options.url,
      options.superuserCredentials
    );
    assert(superuserToken, "Superuser token should not be undefined");

    token = superuserToken;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("load and parse schema", () => {
    it("should return basic schema if no schema is available", async () => {
      const result = (await generateSchema(
        {
          ...options,
          superuserCredentials: undefined,
          localSchema: undefined
        },
        undefined
      )) as ZodObject<Record<string, ZodSchema<unknown>>>;

      expect(result.shape).toHaveProperty("id");
      expect(result.shape).toHaveProperty("collectionId");
      expect(result.shape).toHaveProperty("collectionName");
    });

    it("should return schema from remote if superuser token is provided", async () => {
      const result = (await generateSchema(options, token)) as ZodObject<
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
        "updated"
      ]);
    });

    it("should return schema from local file if path is provided", async () => {
      const result = (await generateSchema(
        {
          ...options,
          superuserCredentials: undefined,
          localSchema: "test/_mocks/superuser_schema.json"
        },
        undefined
      )) as ZodObject<Record<string, ZodSchema<unknown>>>;

      expect(Object.keys(result.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "emailVisibility",
        "verified",
        "created",
        "updated"
      ]);
    });
  });

  describe("custom id field", () => {
    it("should not log error if id field is present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          idField: "email"
        },
        token
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log error if id field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          idField: "nonexistent"
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log error if id field is not of a valid type", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          idField: "verified"
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });
  });

  describe("content fields", () => {
    it("should not log error if content field is present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          contentFields: "email"
        },
        token
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log error if content field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          contentFields: "nonexistent"
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log error if one content field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          contentFields: ["email", "nonexistent"]
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });
  });

  describe("updated field", () => {
    it("should log error if updated field is not present in schema", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          updatedField: "nonexistent"
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it("should log warning if updated field is not of type autodate", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      await generateSchema(
        {
          ...options,
          updatedField: "email"
        },
        token
      );

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it("should log warning if updated field does not have onUpdate set", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      await generateSchema(
        {
          ...options,
          updatedField: "created"
        },
        token
      );

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });
  });

  describe("fields filtering", () => {
    it("should include only specified fields when fields option is provided as string", async () => {
      const result = (await generateSchema(
        {
          ...options,
          fields: "email,verified"
        },
        token
      )) as ZodObject<Record<string, ZodSchema<unknown>>>;

      // Should always include basic schema fields
      expect(Object.keys(result.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "verified"
      ]);
    });

    it("should include only specified fields when fields option is provided as array", async () => {
      const result = (await generateSchema(
        {
          ...options,
          fields: ["email", "emailVisibility", "created"]
        },
        token
      )) as ZodObject<Record<string, ZodSchema<unknown>>>;

      // Should always include basic schema fields
      expect(Object.keys(result.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "emailVisibility",
        "created"
      ]);
    });

    it("should include all fields when no fields option is provided", async () => {
      const result = (await generateSchema(options, token)) as ZodObject<
        Record<string, ZodSchema<unknown>>
      >;

      // Should include all available fields
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
        "updated"
      ]);
    });

    it("should log warning when expand field is used", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      await generateSchema(
        {
          ...options,
          fields: "email,expand,verified"
        },
        token
      );

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it("should validate content fields against filtered fields", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          fields: "email,verified",
          contentFields: "password" // password not in filtered fields
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `The content field "password" is not present in the schema of the collection "${options.collectionName}".`
      );
    });

    it("should validate updated field against filtered fields", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      await generateSchema(
        {
          ...options,
          fields: "email,verified",
          updatedField: "updated" // updated not in filtered fields
        },
        token
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `The field "updated" is not present in the schema of the collection "${options.collectionName}".\nThis will lead to errors when trying to fetch only updated entries.`
      );
    });
  });

  it("should return entry with transformed file fields", async () => {
    const testOptions = { ...options, collectionName: "users" };
    const schema = await generateSchema(testOptions, token);

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
});
