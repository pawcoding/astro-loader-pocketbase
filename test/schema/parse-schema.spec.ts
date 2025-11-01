import { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { parseSchema } from "../../src/schema/parse-schema";
import type { PocketBaseCollection } from "../../src/types/pocketbase-schema.type";

describe("parseSchema", () => {
  describe("number", () => {
    test("should parse number fields correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "numberCollection",
        type: "base",
        fields: [{ name: "age", type: "number", required: true, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        age: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ age: "42" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional number fields correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "numberCollection",
        type: "base",
        fields: [
          { name: "age", type: "number", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        age: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse optional number fields correctly with improved types", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "numberCollection",
        type: "base",
        fields: [
          { name: "age", type: "number", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: true
      });

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
        id: "collectionId",
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        isAdult: true
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ isAdult: "true" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional boolean fields correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        isAdult: true
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse optional boolean fields correctly with improved types", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "booleanCollection",
        type: "base",
        fields: [
          { name: "isAdult", type: "bool", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: true
      });

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
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });

    test("should parse autodate fields with onCreate correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        status: "active"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ status: "invalid" })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should throw an error if no values are defined", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      expect(() =>
        parseSchema(collection, undefined, {
          hasSuperuserRights: false,
          improveTypes: false
        })
      ).toThrow();
    });

    test("should parse select fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        user: "123"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ user: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse relation fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        user: ["123", "456"]
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ user: ["123", 456] })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional relation fields correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        avatar: "https://example.com/avatar.jpg"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ avatar: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse file fields with multiple values correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, customSchemas, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
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

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

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
        id: "collectionId",
        name: "stringCollection",
        type: "base",
        fields: [{ name: "name", type: "text", required: true, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        name: "John Doe"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ name: 123 })).toThrow();
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should parse optional text fields correctly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "stringCollection",
        type: "base",
        fields: [{ name: "name", type: "text", required: false, hidden: false }]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        name: "John Doe"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(z.object(schema).parse({})).toEqual({});
    });
  });

  describe("experimental live types", () => {
    test("should treat date fields as strings when experimentalLiveTypesOnly is true", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false,
        experimentalLiveTypesOnly: true
      });

      const valid = {
        birthday: "2023-12-01T10:00:00Z"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({})).toThrow();
    });

    test("should treat autodate fields as strings when experimentalLiveTypesOnly is true", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "created", type: "autodate", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false,
        experimentalLiveTypesOnly: true
      });

      const valid = {
        created: "2023-12-01T10:00:00Z"
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(() => z.object(schema).parse({ created: new Date() })).toThrow();
    });

    test("should parse date fields normally when experimentalLiveTypesOnly is false", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false,
        experimentalLiveTypesOnly: false
      });

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(
        z.object(schema).parse({ birthday: valid.birthday.toISOString() })
      ).toEqual({ birthday: valid.birthday });
    });

    test("should parse date fields normally when experimentalLiveTypesOnly is undefined", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false
      });

      const valid = {
        birthday: new Date()
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);
      expect(
        z.object(schema).parse({ birthday: valid.birthday.toISOString() })
      ).toEqual({ birthday: valid.birthday });
    });

    test("should handle mixed field types with experimentalLiveTypesOnly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "mixedCollection",
        type: "base",
        fields: [
          { name: "title", type: "text", required: true, hidden: false },
          { name: "birthday", type: "date", required: true, hidden: false },
          { name: "created", type: "autodate", required: true, hidden: false },
          { name: "count", type: "number", required: true, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false,
        experimentalLiveTypesOnly: true
      });

      const valid = {
        title: "Test Title",
        birthday: "2023-12-01T10:00:00Z",
        created: "2023-12-01T10:00:00Z",
        count: 42
      };

      expect(z.object(schema).parse(valid)).toEqual(valid);

      // Date should not work as Date object
      expect(() =>
        z.object(schema).parse({
          ...valid,
          birthday: new Date()
        })
      ).toThrow();

      // Other types should work normally
      expect(() =>
        z.object(schema).parse({
          ...valid,
          count: "not a number"
        })
      ).toThrow();
    });

    test("should handle optional date fields with experimentalLiveTypesOnly", () => {
      const collection: PocketBaseCollection = {
        id: "collectionId",
        name: "dateCollection",
        type: "base",
        fields: [
          { name: "birthday", type: "date", required: false, hidden: false }
        ]
      };

      const schema = parseSchema(collection, undefined, {
        hasSuperuserRights: false,
        improveTypes: false,
        experimentalLiveTypesOnly: true
      });

      const validWithDate = {
        birthday: "2023-12-01T10:00:00Z"
      };

      const validEmpty = {};

      expect(z.object(schema).parse(validWithDate)).toEqual(validWithDate);
      expect(z.object(schema).parse(validEmpty)).toEqual(validEmpty);
    });
  });
});
