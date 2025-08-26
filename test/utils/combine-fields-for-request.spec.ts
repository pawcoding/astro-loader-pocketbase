import { describe, expect, it } from "vitest";
import { combineFieldsForRequest } from "../../src/utils/combine-fields-for-request";

const SYSTEM_FIELDS = ["id", "collectionId", "collectionName"];

describe("combineFieldsForRequest", () => {
  describe("when no user fields are provided", () => {
    it("should return undefined for undefined input", () => {
      const result = combineFieldsForRequest(undefined, {});
      expect(result).toBeUndefined();
    });
  });

  describe("when user fields are provided", () => {
    it("should combine basic and user fields without hardcoded special fields", () => {
      const userFields = ["title", "content"];
      const result = combineFieldsForRequest(userFields, {});

      expect(result).toEqual(expect.arrayContaining(SYSTEM_FIELDS));
      expect(result).toEqual(expect.arrayContaining(userFields));
      expect(result).length(SYSTEM_FIELDS.length + userFields.length);
    });

    it("should include custom option fields when specified", () => {
      const userFields = ["title", "content"];
      const options = {
        idField: "custom_id",
        updatedField: "modified_at",
        contentFields: ["description", "body"]
      };
      const result = combineFieldsForRequest(userFields, options);

      expect(result).toEqual(expect.arrayContaining(SYSTEM_FIELDS));
      expect(result).toEqual(expect.arrayContaining(userFields));
      expect(result).toEqual(
        expect.arrayContaining([
          options.idField,
          options.updatedField,
          ...options.contentFields
        ])
      );
      expect(result).length(SYSTEM_FIELDS.length + userFields.length + 4);
    });

    it("should handle single content field as string", () => {
      const userFields = ["title"];
      const options = {
        contentFields: "content"
      };
      const result = combineFieldsForRequest(userFields, options);

      expect(result).toEqual(expect.arrayContaining(SYSTEM_FIELDS));
      expect(result).toEqual(expect.arrayContaining(userFields));
      expect(result).toEqual(expect.arrayContaining([options.contentFields]));
      expect(result).length(SYSTEM_FIELDS.length + userFields.length + 1);
    });
  });
});
