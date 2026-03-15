import type { ZodObject, ZodType } from "astro/zod";
import { describe, expect, inject, it, vi } from "vitest";
import type { PocketBaseLoaderOptions } from "../../src";
import { generateSchema } from "../../src/schema/generate-schema";
import { createLoaderOptions } from "../_mocks/create-loader-options";

describe("generateSchema", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  const token = inject("superuserToken");

  describe("load and parse schema", () => {
    it("should return basic schema if no schema is available", async () => {
      const { schema: result } = await generateSchema(
        {
          ...options,
          superuserCredentials: undefined,
          localSchema: undefined
        },
        undefined
      );

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      expect(zodObject.shape).toHaveProperty("id");
      expect(zodObject.shape).toHaveProperty("collectionId");
      expect(zodObject.shape).toHaveProperty("collectionName");
    });

    it("should return schema from remote if superuser token is provided", async () => {
      const { schema: result } = await generateSchema(options, token);

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      expect(Object.keys(zodObject.shape)).toEqual([
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
      const { schema: result } = await generateSchema(
        {
          ...options,
          superuserCredentials: undefined,
          localSchema: "test/_mocks/superuser_schema.json"
        },
        undefined
      );

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      expect(Object.keys(zodObject.shape)).toEqual([
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
      const { schema: result } = await generateSchema(
        {
          ...options,
          fields: "email,verified"
        },
        token
      );

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      // Should always include basic schema fields
      expect(Object.keys(zodObject.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "verified"
      ]);
    });

    it("should include only specified fields when fields option is provided as array", async () => {
      const { schema: result } = await generateSchema(
        {
          ...options,
          fields: ["email", "emailVisibility", "created"]
        },
        token
      );

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      // Should always include basic schema fields
      expect(Object.keys(zodObject.shape)).toEqual([
        "id",
        "collectionId",
        "collectionName",
        "email",
        "emailVisibility",
        "created"
      ]);
    });

    it("should include all fields when no fields option is provided", async () => {
      const { schema: result } = await generateSchema(options, token);

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      // Should include all available fields
      expect(Object.keys(zodObject.shape)).toEqual([
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

    it("should include extra fields when provided via options", async () => {
      const testOptions: PocketBaseLoaderOptions = {
        ...options,
        idField: "email",
        updatedField: "updated",
        contentFields: "password",
        fields: ["emailVisibility"]
      };

      const { schema: result } = await generateSchema(testOptions, token);

      const zodObject = result as ZodObject<Record<string, ZodType>>;
      // Should include extra fields
      expect(Object.keys(zodObject.shape)).toEqual(
        expect.arrayContaining([
          "id",
          "collectionId",
          "collectionName",
          "password",
          "email",
          "emailVisibility",
          "updated"
        ])
      );
      expect(Object.keys(zodObject.shape)).toHaveLength(7);
    });
  });

  it("should return file fields information for collections with file fields", async () => {
    const testOptions = { ...options, collectionName: "users" };
    const { schema, fileFields } = await generateSchema(testOptions, token);

    // Schema should be returned without transform
    const zodObject = schema as ZodObject<Record<string, ZodType>>;
    expect(zodObject.shape).toHaveProperty("avatar");

    // File fields should be identified
    expect(fileFields).toHaveLength(1);
    expect(fileFields[0].name).toBe("avatar");
    expect(fileFields[0].type).toBe("file");

    // Schema should accept file names (strings), not URLs
    // Transformation happens in the loader layer
    const entry = {
      id: "123",
      collectionId: "456",
      collectionName: "users",
      password: "password",
      tokenKey: "tokenKey",
      email: "test@pawcode.de",
      created: new Date("2001-12-06"),
      updated: new Date(),
      avatar: "file.jpg", // File name, not URL
      emailVisibility: true,
      verified: false
    };

    // Schema parse should work with file names
    const parsed = schema.parse(entry);
    expect(parsed).toMatchObject({
      ...entry,
      avatar: "file.jpg" // Not transformed yet
    });
  });
});
