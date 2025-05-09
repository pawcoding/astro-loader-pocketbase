import { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { parseSchema } from "../../src/schema/parse-schema";
import type { PocketBaseCollection } from "../../src/types/pocketbase-schema.type";

describe("parseSchema", () => {
  describe("number", () => {
    test("should parse number fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "numberCollection",
        type: "base",
        fields: [{ name: "age", type: "number", required: true, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        age: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ age: "42" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional number fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "numberCollection",
        type: "base",
        fields: [
          { name: "age", type: "number", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        age: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse optional number fields correctly with improved types", () => {
      const collection: PocketBaseCollection = {
        name: "numberCollection",
        type: "base",
        fields: [
          { name: "age", type: "number", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, true);

      const valid = {
        age: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({})).toThrow();
    });
  });

  describe("boolean", () => {
    test("should parse boolean fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        isAdult: true
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ isAdult: "true" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional boolean fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        isAdult: true
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse optional boolean fields correctly with improved types", () => {
      const collection: PocketBaseCollection = {
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, true);

      const valid = {
        isAdult: true
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({})).toThrow();
    });
  });

  describe("date", () => {
    test("should parse date fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(
        z.object(schema).parse({ birthday: valid.birthday.toISOString() })
      ).toEqual({ birthday: valid.birthday });
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional date fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("autodate", () => {
    test("should parse autodate fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "dateCollection",
        type: "base",
        fields: [
          {
            name: "birthday",
            type: "autodate",
            required: true,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(
        z.object(schema).parse({ birthday: valid.birthday.toISOString() })
      ).toEqual({ birthday: valid.birthday });
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional autodate fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "dateCollection",
        type: "base",
        fields: [
          {
            name: "birthday",
            type: "autodate",
            required: false,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse autodate fields with onCreate correctly", () => {
      const collection: PocketBaseCollection = {
        name: "dateCollection",
        type: "base",
        fields: [
          {
            name: "birthday",
            type: "autodate",
            required: true,
            hidden: false,
            onCreate: true
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({})).toThrow();
    });
  });

  describe("geoPoint", () => {
    test("should parse geoPoint fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "geoPointCollection",
        type: "base",
        fields: [
          {
            name: "coordinates",
            type: "geoPoint",
            required: true,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        coordinates: { lon: 12.34, lat: 56.78 }
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() =>
        z.object(schema).parse({ coordinates: { lon: true, lat: false } })
      ).toThrow();
      expect(() => z.object(schema).parse({ coordinates: {} })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional geoPoint fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "geoPointCollection",
        type: "base",
        fields: [
          {
            name: "coordinates",
            type: "geoPoint",
            required: false,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        coordinates: { lon: 12.34, lat: 56.78 }
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("select", () => {
    test("should parse select fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "selectCollection",
        type: "base",
        fields: [
          {
            name: "status",
            type: "select",
            required: true,
            hidden: false,
            values: ["active", "inactive"]
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        status: "active"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ status: "invalid" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should throw an error if no values are defined", () => {
      const collection: PocketBaseCollection = {
        name: "selectCollection",
        type: "base",
        fields: [
          {
            name: "status",
            type: "select",
            required: true,
            hidden: false
          }
        ]
      };

      expect(() => parseSchema(collection, undefined, false, false)).toThrow();
    });

    test("should parse select fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        name: "selectCollection",
        type: "base",
        fields: [
          {
            name: "status",
            type: "select",
            required: true,
            hidden: false,
            values: ["active", "inactive"],
            maxSelect: 2
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        status: ["active", "inactive"]
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() =>
        z.object(schema).parse({ status: ["active", "invalid"] })
      ).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional select fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "selectCollection",
        type: "base",
        fields: [
          {
            name: "status",
            type: "select",
            required: false,
            hidden: false,
            values: ["active", "inactive"]
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        status: "active"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ status: "invalid" })).toThrow();
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("relation", () => {
    test("should parse relation fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "relationCollection",
        type: "base",
        fields: [
          {
            name: "user",
            type: "relation",
            required: true,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        user: "123"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ user: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse relation fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        name: "relationCollection",
        type: "base",
        fields: [
          {
            name: "user",
            type: "relation",
            required: true,
            hidden: false,
            maxSelect: 2
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        user: ["123", "456"]
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ user: ["123", 456] })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional relation fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "relationCollection",
        type: "base",
        fields: [
          {
            name: "user",
            type: "relation",
            required: false,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        user: "123"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ user: 123 })).toThrow();
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("file", () => {
    test("should parse file fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "fileCollection",
        type: "base",
        fields: [
          {
            name: "avatar",
            type: "file",
            required: true,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        avatar: "https://example.com/avatar.jpg"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ avatar: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse file fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        name: "fileCollection",
        type: "base",
        fields: [
          {
            name: "avatar",
            type: "file",
            required: true,
            hidden: false,
            maxSelect: 2
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        avatar: [
          "https://example.com/avatar.jpg",
          "https://example.com/avatar2.jpg"
        ]
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() =>
        z
          .object(schema)
          .parse({ avatar: ["https://example.com/avatar.jpg", 123] })
      ).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional file fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "fileCollection",
        type: "base",
        fields: [
          {
            name: "avatar",
            type: "file",
            required: false,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        avatar: "https://example.com/avatar.jpg"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ avatar: 123 })).toThrow();
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("json", () => {
    test("should parse json fields with custom schema correctly", () => {
      const collection: PocketBaseCollection = {
        name: "jsonCollection",
        type: "base",
        fields: [
          {
            name: "settings",
            type: "json",
            required: true,
            hidden: false
          }
        ]
      };

      const customSchemas = {
        settings: z.object({
          theme: z.string(),
          darkMode: z.boolean()
        })
      };

      const schema = parseSchema(collection, customSchemas, false, false);

      const valid = {
        settings: {
          theme: "light",
          darkMode: true
        }
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() =>
        z.object(schema).parse({ settings: { theme: 123 } })
      ).toThrow();
      expect(() => z.object(schema).parse({ settings: "invalid" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse json fields without custom schema correctly", () => {
      const collection: PocketBaseCollection = {
        name: "jsonCollection",
        type: "base",
        fields: [
          {
            name: "settings",
            type: "json",
            required: true,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        settings: {
          theme: "light",
          darkMode: true
        }
      };
      const valid2 = {
        settings: 1234
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse(valid2)).toEqual(valid2);
    });

    test("should parse optional json fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "jsonCollection",
        type: "base",
        fields: [
          {
            name: "settings",
            type: "json",
            required: false,
            hidden: false
          }
        ]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        settings: {
          theme: "light",
          darkMode: true
        }
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("text", () => {
    test("should parse text fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "stringCollection",
        type: "base",
        fields: [{ name: "name", type: "text", required: true, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        name: "John Doe"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ name: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional text fields correctly", () => {
      const collection: PocketBaseCollection = {
        name: "stringCollection",
        type: "base",
        fields: [{ name: "name", type: "text", required: false, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, false, false);

      const valid = {
        name: "John Doe"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });
  });
});
